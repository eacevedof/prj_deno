export class Decoder {
    public static getInstance(): Decoder {
        return new Decoder();
    }

    public getDecodedFromBase64(base64String: string): string {
        const base64Regex: RegExp = /^[A-Za-z0-9+/=]+$/;
        if (!base64Regex.test(base64String)) {
            //console.warn("Invalid Base64 string provided:", base64String);
            return base64String;
        }
        
        try {
            return atob(base64String);
        }
        catch (error) {
            console.error("Error decoding Base64 string64Based:", error);
            return base64String;
        }
    }

}