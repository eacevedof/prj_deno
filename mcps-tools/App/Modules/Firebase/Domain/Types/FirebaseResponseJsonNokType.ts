/**
 * @documentation errors:
 * https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode
 */
export type FirebaseResponseJsonNokType = {
    error: {
        code: number; //400
        message: string; //The registration token is not a valid FCM registration token,
        status: string; //INVALID_ARGUMENT
        details: Array<{
            "@type": string; //"@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
            errorCode: string; //INVALID_ARGUMENT
        }>
    }

}