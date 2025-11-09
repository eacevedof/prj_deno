import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";

export class SendPushNotificationDto {

    private readonly notificationAuthToken: string;
    private readonly notificationTitle: string;
    private readonly notificationBody: string;

    constructor(primitives: {
        notificationToken: string;
        title: string;
        body: string;
    }) {
        this.notificationAuthToken = primitives.notificationToken.trim();
        this.notificationTitle = primitives.title.trim();
        this.notificationBody = primitives.body.trim();
    }

    public static fromPrimitives(primitives: {
        notificationToken: string;
        title: string;
        body: string;
    }): SendPushNotificationDto {
        return new SendPushNotificationDto(primitives);
    }

    public static fromHttpRequest(httpRequest: InterfaceCustomRequest): SendPushNotificationDto {
        return new SendPushNotificationDto({
            notificationToken: httpRequest.getPostParameter("notificationToken", "") as string,
            title: httpRequest.getPostParameter("title", "") as string,
            body: httpRequest.getPostParameter("body", "") as string,
        });
    }

    public getNotificationToken(): string {
        return this.notificationAuthToken;
    }

    public getNotificationBody(): string {
        return this.notificationBody;
    }

    public getNotificationTitle(): string {
        return this.notificationTitle;
    }
}