import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { WhisperApiClient } from "App/Modules/Transcription/Infrastructure/Clients/WhisperApiClient.ts";
import { AnalyzeMeetingTranscriptionService } from "App/Modules/FunctionalAnalysis/Application/AnalyzeMeetingTranscription/AnalyzeMeetingTranscriptionService.ts";
import { AzureWikiApiClient } from "App/Modules/AzureWiki/Infrastructure/Repositories/AzureWikiApiClient.ts";

export class TranscribeAndAnalyzeController {

    public static getInstance(): TranscribeAndAnalyzeController {
        return new TranscribeAndAnalyzeController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            const audioPath = lzRequest.getPostParameter("audio_path", "") as string;
            const wikiPath = lzRequest.getPostParameter("wiki_path", "") as string;

            if (!audioPath || !wikiPath) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: HttpResponseCodeEnum.BAD_REQUEST,
                    message: "Missing required parameters: audio_path, wiki_path",
                });
            }

            // Step 1: Transcribir audio
            Logger.getInstance().logInfo(`[MCP] Transcribiendo audio: ${audioPath}`);
            const whisperClient = WhisperApiClient.getInstance();
            const transcriptionResult = await whisperClient.transcribe(audioPath);

            // Step 2: Analizar con Claude
            Logger.getInstance().logInfo(`[MCP] Analizando transcripción con Claude...`);
            const analysisService = AnalyzeMeetingTranscriptionService.getInstance();
            const functionalAnalysis = await analysisService.invoke(transcriptionResult.text);

            // Step 3: Crear página en Wiki
            Logger.getInstance().logInfo(`[MCP] Creando página en Azure Wiki: ${wikiPath}`);
            const wikiClient = AzureWikiApiClient.getInstance();
            const wikiPage = await wikiClient.createPage({
                path: wikiPath,
                content: functionalAnalysis,
            });

            Logger.getInstance().logInfo(`[MCP] Análisis funcional creado: ${wikiPage.url}`);

            return CustomResponse.fromResponseDtoPrimitives({
                message: "transcribe-and-analyze-success",
                data: {
                    wiki_url: wikiPage.url,
                    wiki_path: wikiPage.path,
                    transcription_length: transcriptionResult.text.length,
                    analysis_length: functionalAnalysis.length,
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
