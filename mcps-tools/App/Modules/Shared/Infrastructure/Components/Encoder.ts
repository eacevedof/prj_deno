import { md5 } from "npm:js-md5";

export class Encoder {
    public static getInstance(): Encoder {
        return new Encoder();
    }

    public getMd5Hash(input: string): string {
        return md5(input);
    }

}