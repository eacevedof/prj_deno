export class Slugger {

    public static getInstance(): Slugger {
        return new Slugger();
    }

    public getSluggedText(text: string): string {
        const slug = text.trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return slug;
    }

}
