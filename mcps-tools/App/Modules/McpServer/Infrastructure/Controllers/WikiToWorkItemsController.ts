import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { AzureWikiApiClient } from "App/Modules/AzureWiki/Infrastructure/Repositories/AzureWikiApiClient.ts";
import { GenerateWorkItemsStructureService } from "App/Modules/FunctionalAnalysis/Application/GenerateWorkItemsStructure/GenerateWorkItemsStructureService.ts";
import { AzureDevOpsApiClient } from "App/Modules/AzureDevOps/Infrastructure/Repositories/AzureDevOpsApiClient.ts";

export class WikiToWorkItemsController {

    public static getInstance(): WikiToWorkItemsController {
        return new WikiToWorkItemsController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            const wikiPageId = lzRequest.getPostParameter("wiki_page_id", "") as string;

            if (!wikiPageId) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: HttpResponseCodeEnum.BAD_REQUEST,
                    message: "Missing required parameters: wiki_page_id",
                });
            }

            // Step 1: Obtener contenido del wiki
            Logger.getInstance().logInfo(`[MCP] Obteniendo página wiki: ${wikiPageId}`);
            const wikiClient = AzureWikiApiClient.getInstance();
            const wikiPage = await wikiClient.getPage(wikiPageId);

            // Step 2: Generar estructura de work items
            Logger.getInstance().logInfo(`[MCP] Generando épicas y tareas con Claude...`);
            const workItemsService = GenerateWorkItemsStructureService.getInstance();
            const workItemsStructure = await workItemsService.invoke(wikiPage.content);

            // Step 3: Crear work items en Azure DevOps
            Logger.getInstance().logInfo(`[MCP] Creando work items en Azure DevOps...`);
            const devopsClient = AzureDevOpsApiClient.getInstance();

            const createdEpics = [];
            let totalTasks = 0;

            for (const epicData of workItemsStructure.epics) {
                const epic = await devopsClient.createEpic({
                    title: epicData.title,
                    description: epicData.description,
                });

                createdEpics.push({
                    id: epic.id,
                    title: epic.title,
                    url: epic.url,
                });

                for (const taskData of epicData.tasks) {
                    await devopsClient.createTask({
                        title: taskData.title,
                        description: taskData.description,
                        parentId: epic.id,
                        effort: taskData.effort,
                    });
                    totalTasks++;
                }

                Logger.getInstance().logInfo(`[MCP] Épica creada: ${epic.title} (${epicData.tasks.length} tareas)`);
            }

            return CustomResponse.fromResponseDtoPrimitives({
                message: "wiki-to-workitems-success",
                data: {
                    epics_created: createdEpics.length,
                    tasks_created: totalTasks,
                    epics: createdEpics,
                },
            });

        } catch (error) {
            Logger.getInstance().logException(error);

            return CustomResponse.fromResponseDtoPrimitives({
                code: HttpResponseCodeEnum.INTERNAL_SERVER_ERROR,
                message: HttpResponseMessageEnum.INTERNAL_SERVER_ERROR,
                data: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
