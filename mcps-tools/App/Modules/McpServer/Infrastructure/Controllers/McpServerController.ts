import { WhisperApiClient } from "App/Modules/Transcription/Infrastructure/Clients/WhisperApiClient.ts";
import { AnalyzeMeetingTranscriptionService } from "App/Modules/FunctionalAnalysis/Application/AnalyzeMeetingTranscription/AnalyzeMeetingTranscriptionService.ts";
import { GenerateWorkItemsStructureService } from "App/Modules/FunctionalAnalysis/Application/GenerateWorkItemsStructure/GenerateWorkItemsStructureService.ts";
import { GeneratePlaywrightTestsService } from "App/Modules/FunctionalAnalysis/Application/GeneratePlaywrightTests/GeneratePlaywrightTestsService.ts";
import { AzureWikiApiClient } from "App/Modules/AzureWiki/Infrastructure/Repositories/AzureWikiApiClient.ts";
import { AzureDevOpsApiClient } from "App/Modules/AzureDevOps/Infrastructure/Repositories/AzureDevOpsApiClient.ts";
import { McpToolNameEnum, McpToolArgumentsType } from "App/Modules/McpServer/Domain/Types/McpToolType.ts";

export class McpServerController {

    private static instance: McpServerController | null = null;

    private constructor() {}

    public static getInstance(): McpServerController {
        if (!McpServerController.instance) {
            McpServerController.instance = new McpServerController();
        }
        return McpServerController.instance;
    }

    /**
     * MCP Tool 1: Audio → Transcripción → Análisis → Wiki
     */
    public async transcribeAndAnalyze(args: McpToolArgumentsType): Promise<string> {
        if (!args.audio_path || !args.wiki_path) {
            throw new Error("Missing required arguments: audio_path, wiki_path");
        }

        try {
            // Step 1: Transcribir audio con Whisper
            console.log(`[MCP] 📝 Transcribiendo audio: ${args.audio_path}`);
            const whisperClient = WhisperApiClient.getInstance();
            const transcriptionResult = await whisperClient.transcribe(args.audio_path);

            // Step 2: Analizar transcripción con Claude
            console.log(`[MCP] 🤖 Analizando transcripción con Claude...`);
            const analysisService = AnalyzeMeetingTranscriptionService.getInstance();
            const functionalAnalysis = await analysisService.invoke(transcriptionResult.text);

            // Step 3: Subir a Azure Wiki
            console.log(`[MCP] 📚 Creando página en Azure Wiki: ${args.wiki_path}`);
            const wikiClient = AzureWikiApiClient.getInstance();
            const wikiPage = await wikiClient.createPage({
                path: args.wiki_path,
                content: functionalAnalysis,
            });

            console.log(`[MCP] ✅ Análisis funcional creado: ${wikiPage.url}`);

            return JSON.stringify({
                success: true,
                wiki_url: wikiPage.url,
                wiki_path: wikiPage.path,
                transcription_length: transcriptionResult.text.length,
                analysis_length: functionalAnalysis.length,
                preview: functionalAnalysis.substring(0, 500) + "...",
            }, null, 2);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] ❌ Error in transcribeAndAnalyze: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * MCP Tool 2: Wiki → Work Items (Épicas + Tareas)
     */
    public async wikiToWorkItems(args: McpToolArgumentsType): Promise<string> {
        if (!args.wiki_page_id || !args.project_name) {
            throw new Error("Missing required arguments: wiki_page_id, project_name");
        }

        try {
            // Step 1: Obtener contenido del wiki
            console.log(`[MCP] 📚 Obteniendo página wiki: ${args.wiki_page_id}`);
            const wikiClient = AzureWikiApiClient.getInstance();
            const wikiPage = await wikiClient.getPage(args.wiki_page_id);

            // Step 2: Generar estructura de work items con Claude
            console.log(`[MCP] 🤖 Generando épicas y tareas con Claude...`);
            const workItemsService = GenerateWorkItemsStructureService.getInstance();
            const workItemsStructure = await workItemsService.invoke(wikiPage.content);

            // Step 3: Crear work items en Azure DevOps
            console.log(`[MCP] 📋 Creando work items en Azure DevOps...`);
            const devopsClient = AzureDevOpsApiClient.getInstance();

            const createdEpics = [];
            let totalTasks = 0;

            for (const epicData of workItemsStructure.epics) {
                // Crear épica
                const epic = await devopsClient.createEpic({
                    title: epicData.title,
                    description: epicData.description,
                });

                createdEpics.push({
                    id: epic.id,
                    title: epic.title,
                    url: epic.url,
                });

                // Crear tareas hijas
                for (const taskData of epicData.tasks) {
                    await devopsClient.createTask({
                        title: taskData.title,
                        description: taskData.description,
                        parentId: epic.id,
                        effort: taskData.effort,
                    });
                    totalTasks++;
                }

                console.log(`[MCP] ✅ Épica creada: ${epic.title} (${epicData.tasks.length} tareas)`);
            }

            return JSON.stringify({
                success: true,
                epics_created: createdEpics.length,
                tasks_created: totalTasks,
                epics: createdEpics,
            }, null, 2);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] ❌ Error in wikiToWorkItems: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * MCP Tool 3: Criterios de Aceptación → Tests Playwright
     */
    public async criteriaToPlaywright(args: McpToolArgumentsType): Promise<string> {
        if (!args.acceptance_criteria || !args.output_path) {
            throw new Error("Missing required arguments: acceptance_criteria, output_path");
        }

        try {
            // Step 1: Generar tests Playwright con Claude
            console.log(`[MCP] 🤖 Generando tests Playwright con Claude...`);
            const playwrightService = GeneratePlaywrightTestsService.getInstance();
            const playwrightCode = await playwrightService.invoke(args.acceptance_criteria);

            // Step 2: Guardar archivo
            console.log(`[MCP] 💾 Guardando tests en: ${args.output_path}`);
            await Deno.writeTextFile(args.output_path, playwrightCode);

            console.log(`[MCP] ✅ Tests generados exitosamente`);

            return JSON.stringify({
                success: true,
                output_path: args.output_path,
                code_length: playwrightCode.length,
                preview: playwrightCode.substring(0, 500) + "...",
            }, null, 2);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] ❌ Error in criteriaToPlaywright: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Dispatcher principal para invocar tools
     */
    public async invokeTool(toolName: McpToolNameEnum, args: McpToolArgumentsType): Promise<string> {
        switch (toolName) {
            case McpToolNameEnum.TRANSCRIBE_AND_ANALYZE:
                return await this.transcribeAndAnalyze(args);

            case McpToolNameEnum.WIKI_TO_WORKITEMS:
                return await this.wikiToWorkItems(args);

            case McpToolNameEnum.CRITERIA_TO_PLAYWRIGHT:
                return await this.criteriaToPlaywright(args);

            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
}
