import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { WikiPageType, CreateWikiPageRequestType } from "App/Modules/AzureWiki/Domain/Types/WikiPageType.ts";

export class AzureWikiApiClient {

    private static instance: AzureWikiApiClient | null = null;
    private readonly organizationUrl: string;
    private readonly projectName: string;
    private readonly wikiId: string;
    private readonly pat: string;

    private constructor() {
        this.organizationUrl = getEnv(EnvKeyEnum.AZURE_DEVOPS_ORG_URL) ?? "";
        this.projectName = getEnv(EnvKeyEnum.AZURE_DEVOPS_PROJECT) ?? "";
        this.wikiId = getEnv(EnvKeyEnum.AZURE_WIKI_ID) ?? "";
        this.pat = getEnv(EnvKeyEnum.AZURE_DEVOPS_PAT) ?? "";

        if (!this.organizationUrl || !this.projectName || !this.wikiId || !this.pat) {
            throw new Error("Azure DevOps configuration incomplete in environment variables");
        }
    }

    public static getInstance(): AzureWikiApiClient {
        if (!AzureWikiApiClient.instance) {
            AzureWikiApiClient.instance = new AzureWikiApiClient();
        }
        return AzureWikiApiClient.instance;
    }

    private getAuthHeader(): string {
        return `Basic ${btoa(`:${this.pat}`)}`;
    }

    public async createPage(request: CreateWikiPageRequestType): Promise<WikiPageType> {
        try {
            const apiUrl = `${this.organizationUrl}/${this.projectName}/_apis/wiki/wikis/${this.wikiId}/pages?path=${encodeURIComponent(request.path)}&api-version=7.0`;

            const response = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": this.getAuthHeader(),
                },
                body: JSON.stringify({
                    content: request.content,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure Wiki API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            return {
                id: result.id,
                path: result.path,
                content: request.content,
                url: result.remoteUrl,
            };
        } catch (error) {
            throw new Error(`Failed to create wiki page: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async getPage(path: string): Promise<WikiPageType> {
        try {
            const apiUrl = `${this.organizationUrl}/${this.projectName}/_apis/wiki/wikis/${this.wikiId}/pages?path=${encodeURIComponent(path)}&includeContent=true&api-version=7.0`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure Wiki API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            return {
                id: result.id,
                path: result.path,
                content: result.content,
                url: result.remoteUrl,
            };
        } catch (error) {
            throw new Error(`Failed to get wiki page: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
