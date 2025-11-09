export class DocumentationViewDto {

    private readonly appVersion: string;
    private readonly appVersionUpdate: string;
    private readonly appBaseUrl: string;

    constructor(primitives: {
        appVersion: string;
        appVersionUpdate: string;
        appBaseUrl: string;
    }) {
        this.appVersion = primitives.appVersion.trim();
        this.appVersionUpdate = primitives.appVersionUpdate.trim();
        this.appBaseUrl = primitives.appBaseUrl.trim();
    }

    public static fromPrimitives(primitives: {
        appVersion: string;
        appVersionUpdate: string;
        appBaseUrl: string;
    }): DocumentationViewDto {
        return new DocumentationViewDto(primitives);
    }

    public getAppVersion(): string {
        return this.appVersion;
    }

    public getAppVersionUpdate(): string {
        return this.appVersionUpdate;
    }

    public getAppBaseUrl(): string {
        return this.appBaseUrl;
    }

}
