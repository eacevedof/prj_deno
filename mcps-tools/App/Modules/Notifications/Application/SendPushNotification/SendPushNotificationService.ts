import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";

import { FirebaseReaderApiRepository } from "App/Modules/Firebase/Infrastructure/Repositories/FirebaseReaderApiRepository.ts";
import { FirebaseWriterApiRepository } from "App/Modules/Firebase/Infrastructure/Repositories/FirebaseWriterApiRepository.ts";
import { FirebaseMessageType } from "App/Modules/Firebase/Domain/Types/FirebaseMessageType.ts";

import { SendPushNotificationDto } from "App/Modules/Notifications/Application/SendPushNotification/SendPushNotificationDto.ts";
import { SentPushNotificationDto } from "App/Modules/Notifications/Application/SendPushNotification/SentPushNotificationDto.ts";
import { NotificationsException } from "App/Modules/Notifications/Domain/Exceptions/NotificationsException.ts";

export class SendPushNotificationService {

    private sendPushNotificationDto!: SendPushNotificationDto;

    private readonly logger: Logger = Logger.getInstance();
    private readonly firebaseReaderApiRepository: FirebaseReaderApiRepository = FirebaseReaderApiRepository.getInstance();
    private readonly firebaseWriterApiRepository: FirebaseWriterApiRepository = FirebaseWriterApiRepository.getInstance();

    public static getInstance(): SendPushNotificationService {
        return new SendPushNotificationService();
    }

    public async invoke(sendPushNotificationDto: SendPushNotificationDto): Promise<SentPushNotificationDto> {
        this.sendPushNotificationDto = sendPushNotificationDto;
        //console.log("SendPushNotificationService.invoke", this.sendPushNotificationDto);

        this.failIfWrongInput();

        await this.failIfWrongFcmToken();

        const firebaseMessage:FirebaseMessageType = {
            firebaseDeviceToken: this.sendPushNotificationDto.getNotificationToken(),
            firebaseMessage: {
                title: this.sendPushNotificationDto.getNotificationTitle(),
                body: this.sendPushNotificationDto.getNotificationBody(),
            },
        };
        const fcmIdentifier: string = await this.firebaseWriterApiRepository.sendFirebaseMessage(firebaseMessage);

        if (!fcmIdentifier) {
            this.logger.logError(firebaseMessage, "error sending notification");
            NotificationsException.unexpectedCustom("error sending notification. If the problem persists, contact support");
        }
        
        return SentPushNotificationDto.fromPrimitives({
            notificationId: fcmIdentifier,
        });
        
    }

    private failIfWrongInput(): void {
        if (!this.sendPushNotificationDto.getNotificationToken()) {
            NotificationsException.badRequestCustom("notification token is required");
        }

        if (!this.sendPushNotificationDto.getNotificationTitle()) {
            NotificationsException.badRequestCustom("notification title is required");
        }

        if (!this.sendPushNotificationDto.getNotificationBody()) {
            NotificationsException.badRequestCustom("notification body is required");
        }
    }

    private async failIfWrongFcmToken(): Promise<void> {

        if (!this.firebaseReaderApiRepository.isValidFcmTokenFormat(
            this.sendPushNotificationDto.getNotificationToken()
        )) {
            this.logger.logSecurity(`notification token has not valid format ${this.sendPushNotificationDto.getNotificationToken()}`);
            NotificationsException.badRequestCustom(`notification token has not valid format ${this.sendPushNotificationDto.getNotificationToken()}`);
        }

        if (!await this.firebaseReaderApiRepository.isValidFcmTokenByDryRun(
            this.sendPushNotificationDto.getNotificationToken()
        )){
            this.logger.logSecurity(`unrecognized token ${this.sendPushNotificationDto.getNotificationToken()}`);
            NotificationsException.badRequestCustom(`unrecognized token ${this.sendPushNotificationDto.getNotificationToken()}`);
        }

    }

}