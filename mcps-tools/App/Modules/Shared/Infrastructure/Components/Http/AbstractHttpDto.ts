export abstract class AbstractHttpDto {

    protected requestHeaders: Record<string, string> = {};
    protected requestMethod: string = "";
    protected requestUrl: string = "";
    protected remoteIp: string = "";

    protected osName: string = "";
    protected osVersion: string = "";

    protected userAgent: string = "";

    protected browserName: string = "";
    protected browserVersion: string = "";

    protected cpuArchitecture: string = "";

    protected deviceModel: string = "";
    protected deviceType: string = "";

    protected engineName: string = "";
    protected engineVersion: string = "";



    constructor(primitives: {
        requestHeaders?: Record<string, string>;
        requestMethod?: string;
        requestUrl?: string;
        remoteIp?: string;
        osName?: string;
        osVersion?: string;
        userAgent?: string;
        browserName?: string;
        browserVersion?: string;
        cpuArchitecture?: string;
        deviceModel?: string;
        deviceType?: string;
        engineName?: string;
        engineVersion?: string;
    }) {
        this.requestHeaders = primitives.requestHeaders || {};
        this.requestMethod = primitives.requestMethod?.trim() ?? "";
        this.requestUrl = primitives.requestUrl?.trim() ?? "";
        this.remoteIp = primitives.remoteIp?.trim() ?? "";
        this.osName = primitives.osName?.trim() ?? "";
        this.osVersion = primitives.osVersion?.trim() ?? "";
        this.userAgent = primitives.userAgent?.trim() ?? "";
        this.browserName = primitives.browserName?.trim() ?? "";
        this.browserVersion = primitives.browserVersion?.trim() ?? "";
        this.cpuArchitecture = primitives.cpuArchitecture?.trim() ?? "";
        this.deviceModel = primitives.deviceModel?.trim() ?? "";
        this.deviceType = primitives.deviceType?.trim() ?? "";
        this.engineName = primitives.engineName?.trim() ?? "";
        this.engineVersion = primitives.engineVersion?.trim() ?? "";
    }

    public getRequestHeaders(): Record<string, string> {
        return this.requestHeaders;
    }

    public getRequestMethod(): string {
        return this.requestMethod;
    }

    public getRequestUrl(): string {
        return this.requestUrl;
    }

    public getRemoteIp(): string {
        return this.remoteIp;
    }

    public getOsName(): string {
        return this.osName;
    }

    public getOsVersion(): string {
        return this.osVersion;
    }

    public getUserAgent(): string {
        return this.userAgent;
    }

    public getBrowserName(): string {
        return this.browserName;
    }

    public getBrowserVersion(): string {
        return this.browserVersion;
    }

    public getCpuArchitecture(): string {
        return this.cpuArchitecture;
    }

    public getDeviceModel(): string {
        return this.deviceModel;
    }

    public getDeviceType(): string {
        return this.deviceType;
    }

    public getEngineName(): string {
        return this.engineName;
    }

    public getEngineVersion(): string {
        return this.engineVersion;
    }

}