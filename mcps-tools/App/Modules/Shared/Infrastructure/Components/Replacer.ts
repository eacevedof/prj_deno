export class Replacer {

    public static getInstance(): Replacer {
        return new Replacer();
    }

    public getReplacedContent(
        content: string,
        toReplace: Record<string, string>
    ): string {
        let result = content;
        for (const key in toReplace) {
            const regex = new RegExp(key, "g");
            result = result.replace(regex, toReplace[key]);
        }
        return result;
    }

}
