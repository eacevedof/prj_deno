import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { HttpResponseMessageEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseMessageEnum.ts";

import { GeneratePlaywrightTestsService } from "App/Modules/FunctionalAnalysis/Application/GeneratePlaywrightTests/GeneratePlaywrightTestsService.ts";

export class CriteriaToPlaywrightController {

    public static getInstance(): CriteriaToPlaywrightController {
        return new CriteriaToPlaywrightController();
    }

    public async invoke(lzRequest: InterfaceCustomRequest): Promise<CustomResponse> {
        try {
            const acceptanceCriteria = lzRequest.getPostParameter("acceptance_criteria", "") as string;
            const outputPath = lzRequest.getPostParameter("output_path", "") as string;

            if (!acceptanceCriteria || !outputPath) {
                return CustomResponse.fromResponseDtoPrimitives({
                    code: HttpResponseCodeEnum.BAD_REQUEST,
                    message: "Missing required parameters: acceptance_criteria, output_path",
                });
            }

            // Step 1: Generar tests con Claude
            Logger.getInstance().logInfo(`[MCP] Generando tests Playwright con Claude...`);
            const playwrightService = GeneratePlaywrightTestsService.getInstance();
            const playwrightCode = await playwrightService.invoke(acceptanceCriteria);

            // Step 2: Guardar archivo
            Logger.getInstance().logInfo(`[MCP] Guardando tests en: ${outputPath}`);
            await Deno.writeTextFile(outputPath, playwrightCode);

            Logger.getInstance().logInfo(`[MCP] Tests generados exitosamente`);

            return CustomResponse.fromResponseDtoPrimitives({
                message: "criteria-to-playwright-success",
                data: {
                    output_path: outputPath,
                    code_length: playwrightCode.length,
                    preview: playwrightCode.substring(0, 300) + "...",
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
