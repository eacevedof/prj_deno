import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { decodeBase64 } from "jsr:@std/encoding/base64";

import { HttpFetcherResponseType } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcherResponseType.ts";

import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { Filer } from "App/Modules/Shared/Infrastructure/Components/Filer.ts";
import { Cacher } from "App/Modules/Shared/Infrastructure/Components/Cacher.ts";
import { HttpFetcher } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcher.ts";

import { FirebaseCredentialType } from "App/Modules/Firebase/Domain/Types/FirebaseCredentialType.ts";
import { GoogleOAuth2ResponseType } from "App/Modules/Firebase/Domain/Types/GoogleOAuth2ResponseType.ts";
import { GoogleOAuth2CacheType } from "App/Modules/Firebase/Domain/Types/GoogleOAuth2CacheType.ts";
import { FirebaseException } from "App/Modules/Firebase/Domain/Exceptions/FirebaseException.ts";

/**
 * @documentation:
 * https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages/send
 * {
 *   "validate_only": boolean,
 *   "message": {
 *     object (Message)
 *   }
 * }
 */
export abstract class AbstractFirebaseApiRepository {

    protected readonly logger: Logger = Logger.getInstance();

    private readonly cacher: Cacher = Cacher.getInstance("firebase.data");
    private readonly cacheKeyForOAuthToken: string = "google-oauth2-token";
    private readonly cacheKeyTtl1HourInMinutes: number = 60;

    private readonly filer: Filer = Filer.getInstance();
    private readonly httpFetcher: HttpFetcher = HttpFetcher.getInstance();

    private readonly firebaseProjectsUrl: string = "https://fcm.googleapis.com/v1/projects";
    private readonly firebaseScopeUrl: string = "https://www.googleapis.com/auth/firebase.messaging";
    private readonly credentialsFilePath: string = `${Deno.cwd()}/App/Modules/Firebase/Infrastructure/Repositories/firebase-credentials.json`;

    private readonly oneMinuteInSeconds: number = 60;
    private readonly oneHourInSeconds: number = this.oneMinuteInSeconds * 60;

    private static firebaseCredentials?: FirebaseCredentialType;

    protected async httpPost(
        firebaseEndpoint:string,
        postPayload:Record<string, unknown>
    ):Promise<HttpFetcherResponseType> {

        await this.tryToLoadFirebaseCredentialsOrFail();

        const googleAuth2Token: string = await this.getGoogleAuth2TokenByPrivateKeyOrFail();
        const fcmEndpoint: string = `${this.firebaseProjectsUrl}/${AbstractFirebaseApiRepository.firebaseCredentials!.project_id}/${firebaseEndpoint}`;

        const fetcherResponse: HttpFetcherResponseType = await this.httpFetcher.httpPost(
            fcmEndpoint,
            postPayload,
            {
                "Authorization": `Bearer ${googleAuth2Token}`,
            }
        );
        /*console.log("\nhttpPost\n",{
            googleAuth2Token,
            fcmEndpoint,
            postPayload,
            response: fetcherResponse
        });*/
        return fetcherResponse;
    }

    private async tryToLoadFirebaseCredentialsOrFail(): Promise<void> {

        if (AbstractFirebaseApiRepository.firebaseCredentials) return;

        const credsAsJson: string = await this.filer.fileGetContent(this.credentialsFilePath);
        if (!credsAsJson) {
            this.logger.logError(`firebase credentials file not found in path: ${this.credentialsFilePath}`);
            FirebaseException.unexpectedCustom("firebase credentials file not found");
        }

        const firebaseCredentials: FirebaseCredentialType = JSON.parse(credsAsJson);
        if (!firebaseCredentials.project_id || !firebaseCredentials.client_email || !firebaseCredentials.private_key) {
            FirebaseException.unexpectedCustom("invalid firebase credentials");
        }

        firebaseCredentials.private_key = firebaseCredentials.private_key.includes("\\n")
            ? firebaseCredentials.private_key.replace(/\\n/g, "\n")
            : firebaseCredentials.private_key;

        AbstractFirebaseApiRepository.firebaseCredentials = firebaseCredentials;

    }

    /**
     * @cache
     */
    private async getGoogleAuth2TokenByPrivateKeyOrFail(): Promise<string> {

        let googleOAuthToken: GoogleOAuth2CacheType | null = null;

        //to-do usar redis en lugar de file system
        const googleOAuthTokenCached: unknown = await this.cacher.get(this.cacheKeyForOAuthToken);
        if (googleOAuthTokenCached) {
            //console.log("\n- using cached google OAuth2 token", googleOAuthTokenCached);
            googleOAuthToken = googleOAuthTokenCached as GoogleOAuth2CacheType;
        }

        const tsNowInSeconds: number = Math.floor(Date.now() / 1000);
        if (googleOAuthToken && ((googleOAuthToken.expires_at - this.oneMinuteInSeconds) > tsNowInSeconds)) {
            //console.log("\n- not expired cached google OAuth2 token");
            return googleOAuthToken.access_token;
        }

        const issuedAt: number = tsNowInSeconds;
        const expiresAt: number = issuedAt + this.oneHourInSeconds;
        const jwtConfig: Record<string, unknown> = {
            //audience: destination of the access_token request
            aud: AbstractFirebaseApiRepository.firebaseCredentials!.token_uri,
            iss: AbstractFirebaseApiRepository.firebaseCredentials!.client_email,
            scope: this.firebaseScopeUrl,
            iat: issuedAt,
            exp: expiresAt,
        };

        const privateKeyAsBinary: ArrayBuffer = this.getPrivateKeyAsBinary();
        const privateKeyAsCryptoKey: CryptoKey = await this.getBinaryKeyAsCryptoKey(privateKeyAsBinary);

        const privateKeyAsJWT: string = await create(
            { alg: "RS256", typ: "JWT" },
            jwtConfig,
            privateKeyAsCryptoKey,
        );

        const fetcherResponse: HttpFetcherResponseType = await this.httpFetcher.httpPost(
            AbstractFirebaseApiRepository.firebaseCredentials!.token_uri,
            {
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: privateKeyAsJWT,
            }
        );

        if (fetcherResponse.status_code >= 400 || fetcherResponse.error) {
            const googleAuth2Error: string = fetcherResponse.error || fetcherResponse.response || "google OAuth2 request failed";
            this.logger.logError(googleAuth2Error);
            FirebaseException.unexpectedCustom("google OAuth2 request failed");
        }

        const googleOAuth2ResponseType: GoogleOAuth2ResponseType = JSON.parse(fetcherResponse.response ?? "{}");

        googleOAuthToken = {
            access_token: googleOAuth2ResponseType.access_token,
            expires_at: tsNowInSeconds + (googleOAuth2ResponseType.expires_in ?? this.oneHourInSeconds),
        };

        await this.cacher.add(
            this.cacheKeyForOAuthToken,
            googleOAuthToken,
            this.cacheKeyTtl1HourInMinutes
        );

        //console.log("\n- new google OAuth2 token fetched and cached:", googleOAuthToken);
        return googleOAuthToken.access_token;
    }

    private getPrivateKeyAsBinary(): ArrayBuffer {
        const privateKeyInBase64: string = AbstractFirebaseApiRepository.firebaseCredentials!.private_key;
        const b64: string = privateKeyInBase64
            .replace(/-----BEGIN PRIVATE KEY-----/g, "")
            .replace(/-----END PRIVATE KEY-----/g, "")
            .replace(/\s+/g, "");
        const bytes: Uint8Array = decodeBase64(b64);

        return bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteLength + bytes.byteOffset,
        );
    }

    private async getBinaryKeyAsCryptoKey(privateKeyAsBinary: ArrayBuffer): Promise<CryptoKey> {
        //const privateKeyAsBinary: ArrayBuffer = this.getPrivateKeyAsBinary();
        return await crypto.subtle.importKey(
            "pkcs8",
            privateKeyAsBinary,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["sign"],
        );
    }

}
