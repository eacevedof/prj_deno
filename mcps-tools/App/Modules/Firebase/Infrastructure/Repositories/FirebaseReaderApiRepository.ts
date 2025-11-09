import { AbstractFirebaseApiRepository } from "App/Modules/Firebase/Infrastructure/Repositories/AbstractFirebaseApiRepository.ts";
import { HttpFetcherResponseType } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcherResponseType.ts";
import { FirebaseResponseJsonOkType } from "App/Modules/Firebase/Domain/Types/FirebaseResponseJsonOkType.ts";
import { FirebaseResponseJsonNokType } from "App/Modules/Firebase/Domain/Types/FirebaseResponseJsonNokType.ts";

export class FirebaseReaderApiRepository extends AbstractFirebaseApiRepository {

    public static getInstance(): FirebaseReaderApiRepository {
        return new FirebaseReaderApiRepository();
    }

    public isValidFcmTokenFormat(fcmToken: string): boolean {
        // Los tokens FCM típicamente tienen ciertas características:
        // - Longitud entre 140-160 caracteres
        // - Contienen caracteres alfanuméricos, guiones, guiones bajos, y dos puntos
        // - Terminan con caracteres específicos
        if (fcmToken.length < 140 || fcmToken.length > 200) return false;

        // Verificar que solo contenga caracteres válidos para tokens FCM
        const validTokenPattern = /^[A-Za-z0-9_:.-]+$/;
        return validTokenPattern.test(fcmToken);
    }

    public async isValidFcmTokenByDryRun(fcmToken: string): Promise<boolean> {
        const postPayload: Record<string, unknown> = {
            message: {
                token: fcmToken,
                notification: {
                    title: "dry-run token title",
                    body: "dry-run token body"
                }
            },
            //esto hace que sea solo validación, no envío real (ver doc oficial)
            validate_only: true
        };

        const fetcherResponse: HttpFetcherResponseType = await this.httpPost("messages:send", postPayload);
        const firebaseResponseJson: FirebaseResponseJsonOkType | FirebaseResponseJsonNokType = JSON.parse(
            fetcherResponse.response ?? "{}"
        );

        const name: string = (firebaseResponseJson as FirebaseResponseJsonOkType).name ?? "";
        //console.log("\nisValidFcmTokenByDryRun\n",{fetcherResponse, firebaseResponseJson, name});

        if (name.includes("projects/examplebsn-someappxxx/messages")) return true;

        this.logger.logError(firebaseResponseJson, `isValidFcmTokenByDryRun: ${fcmToken}`);
        return false;
    }

}
