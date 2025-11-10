import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import {
    WorkItemType,
    CreateEpicRequestType,
    CreateTaskRequestType
} from "App/Modules/AzureDevOps/Domain/Types/WorkItemType.ts";

export class AzureDevOpsApiClient {

    private static instance: AzureDevOpsApiClient | null = null;
    private readonly organizationUrl: string;
    private readonly projectName: string;
    private readonly pat: string;

    private constructor() {
        this.organizationUrl = getEnv(EnvKeyEnum.AZURE_DEVOPS_ORG_URL) ?? "";
        this.projectName = getEnv(EnvKeyEnum.AZURE_DEVOPS_PROJECT) ?? "";
        this.pat = getEnv(EnvKeyEnum.AZURE_DEVOPS_PAT) ?? "";

        if (!this.organizationUrl || !this.projectName || !this.pat) {
            throw new Error("Azure DevOps configuration incomplete in environment variables");
        }
    }

    public static getInstance(): AzureDevOpsApiClient {
        if (!AzureDevOpsApiClient.instance) {
            AzureDevOpsApiClient.instance = new AzureDevOpsApiClient();
        }
        return AzureDevOpsApiClient.instance;
    }

    private getAuthHeader(): string {
        return `Basic ${btoa(`:${this.pat}`)}`;
    }

    public async createEpic(request: CreateEpicRequestType): Promise<WorkItemType> {
        return await this.createWorkItem("Epic", {
            "System.Title": request.title,
            "System.Description": request.description,
            "System.AreaPath": request.areaPath || this.projectName,
            "System.IterationPath": request.iterationPath || this.projectName,
        });
    }

    public async createTask(request: CreateTaskRequestType): Promise<WorkItemType> {
        const fields: Record<string, unknown> = {
            "System.Title": request.title,
            "System.Description": request.description,
            "System.AreaPath": request.areaPath || this.projectName,
            "System.IterationPath": request.iterationPath || this.projectName,
        };

        if (request.effort) {
            fields["Microsoft.VSTS.Scheduling.Effort"] = request.effort;
        }

        const workItem = await this.createWorkItem("Task", fields);

        // Link to parent if provided
        if (request.parentId) {
            await this.linkWorkItems(workItem.id, request.parentId, "System.LinkTypes.Hierarchy-Reverse");
        }

        return workItem;
    }

    private async createWorkItem(
        workItemType: string,
        fields: Record<string, unknown>
    ): Promise<WorkItemType> {
        try {
            const apiUrl = `${this.organizationUrl}/${this.projectName}/_apis/wit/workitems/$${workItemType}?api-version=7.0`;

            const patchDocument = Object.entries(fields).map(([key, value]) => ({
                op: "add",
                path: `/fields/${key}`,
                value: value,
            }));

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json-patch+json",
                    "Authorization": this.getAuthHeader(),
                },
                body: JSON.stringify(patchDocument),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure DevOps API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            return {
                id: result.id,
                title: result.fields["System.Title"],
                workItemType: result.fields["System.WorkItemType"],
                state: result.fields["System.State"],
                description: result.fields["System.Description"],
                url: result._links.html.href,
            };
        } catch (error) {
            throw new Error(`Failed to create ${workItemType}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async linkWorkItems(sourceId: number, targetId: number, linkType: string): Promise<void> {
        try {
            const apiUrl = `${this.organizationUrl}/${this.projectName}/_apis/wit/workitems/${sourceId}?api-version=7.0`;

            const patchDocument = [{
                op: "add",
                path: "/relations/-",
                value: {
                    rel: linkType,
                    url: `${this.organizationUrl}/${this.projectName}/_apis/wit/workItems/${targetId}`,
                },
            }];

            const response = await fetch(apiUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json-patch+json",
                    "Authorization": this.getAuthHeader(),
                },
                body: JSON.stringify(patchDocument),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to link work items: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            throw new Error(`Failed to link work items: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
