import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { AbstractApiController } from "App/Modules/Shared/Infrastructure/Controllers/AbstractApiController.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { AuthenticatorException } from "App/Modules/Authenticator/Application/Domain/Exceptions/AuthenticatorException.ts";

import { SendPushNotificationDto } from "App/Modules/Notifications/Application/SendPushNotification/SendPushNotificationDto.ts";
import { SendPushNotificationService } from "App/Modules/Notifications/Application/SendPushNotification/SendPushNotificationService.ts";
import { SentPushNotificationDto } from "App/Modules/Notifications/Application/SendPushNotification/SentPushNotificationDto.ts";
import { NotificationsException } from "App/Modules/Notifications/Domain/Exceptions/NotificationsException.ts";
import { ExternalApiForwardException } from "App/Modules/Shared/Domain/Exceptions/ExternalApiForwardException.ts";

export class SendPushNotificationController extends AbstractApiController {
    
    public static getInstance(): SendPushNotificationController {
        return new SendPushNotificationController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {

            const sendPushNotificationResponse: SentPushNotificationDto
                = await SendPushNotificationService.getInstance().invoke(
                    SendPushNotificationDto.fromHttpRequest(lzRequest)
            );

            return CustomResponse.fromResponseDtoPrimitives({
                message: "notification sent successfully",
                data: sendPushNotificationResponse.toPrimitives(),
            });
        }
        catch (error) {
            if (
                error instanceof AuthenticatorException ||
                error instanceof ExternalApiForwardException || //firebase hace forward de errores camuflados
                error instanceof NotificationsException
            ) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: error.getStatusCode(),
                    message: error.getMessage(),
                })
            }

            this.handleUnknownError(error, SendPushNotificationController.name.concat(`.invoke`));

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
            });
        }

    }

}