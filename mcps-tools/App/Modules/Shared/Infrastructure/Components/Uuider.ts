export class Uuider {

    public static getInstance() {
        return new Uuider();
    }

    public getRandomUuidWithPrefix(prefix: string): string {
        return "aph-"+prefix+"-"+ crypto.randomUUID().replace(/-/g, "");
    }

    public getRandomAlphaNumericString(length: number=10): string {
        const chars:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
    }

    public getRandomAlphaNumericStringWithPrefix(prefix: string, length: number=10): string {
        const strRandom: string = this.getRandomAlphaNumericString(length);
        return "aph-"+prefix+"-"+strRandom;
    }

}
