export class SentPushNotificationDto {

    private readonly notificationId: string;

    constructor(primitives: { notificationId: string }) {
        this.notificationId = primitives.notificationId;
    }

    public static fromPrimitives(primitives: { notificationId: string }): SentPushNotificationDto {
        return new SentPushNotificationDto(primitives);
    }

    public toPrimitives(): Record<string, unknown> {
        return {
            notification_id: this.notificationId,
        };
    }
}