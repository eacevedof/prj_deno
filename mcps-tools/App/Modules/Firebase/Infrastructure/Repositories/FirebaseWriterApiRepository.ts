import { FirebaseMessageType } from "App/Modules/Firebase/Domain/Types/FirebaseMessageType.ts";
import { AbstractFirebaseApiRepository } from "App/Modules/Firebase/Infrastructure/Repositories/AbstractFirebaseApiRepository.ts";
import { HttpFetcherResponseType } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcherResponseType.ts";
import { FirebaseResponseJsonOkType } from "App/Modules/Firebase/Domain/Types/FirebaseResponseJsonOkType.ts";
import { FirebaseResponseJsonNokType } from "App/Modules/Firebase/Domain/Types/FirebaseResponseJsonNokType.ts";

export class FirebaseWriterApiRepository extends AbstractFirebaseApiRepository {

    public static getInstance(): FirebaseWriterApiRepository {
        return new FirebaseWriterApiRepository();
    }

    public async sendFirebaseMessage(firebaseMessage: FirebaseMessageType): Promise<string> {
        const fetcherResponse: HttpFetcherResponseType = await this.httpPost("messages:send", {
            message: {
                token: firebaseMessage.firebaseDeviceToken,
                notification: firebaseMessage.firebaseMessage,
            },
        });
        const firebaseResponseJson: FirebaseResponseJsonOkType | FirebaseResponseJsonNokType = JSON.parse(
            fetcherResponse.response ?? "{}"
        );

        const fcmId: string = (firebaseResponseJson as FirebaseResponseJsonOkType).name ?? "";
        if (fcmId.includes("projects/examplebsn-someappxxx-notificat/messages"))
            return fcmId;

        this.logger.logError(firebaseResponseJson, `sendFirebaseMessage: ${firebaseMessage.firebaseDeviceToken}`);
        return "";
    }

}
