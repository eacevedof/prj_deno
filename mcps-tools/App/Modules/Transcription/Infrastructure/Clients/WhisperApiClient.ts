import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";
import { TranscriptionResultType } from "App/Modules/Transcription/Domain/Types/TranscriptionResultType.ts";

export class WhisperApiClient {

    private static instance: WhisperApiClient | null = null;
    private readonly apiKey: string;
    private readonly apiUrl: string = "https://api.openai.com/v1/audio/transcriptions";

    private constructor() {
        this.apiKey = getEnv(EnvKeyEnum.OPENAI_API_KEY) ?? "";
        if (!this.apiKey) {
            throw new Error("OPENAI_API_KEY not found in environment variables");
        }
    }

    public static getInstance(): WhisperApiClient {
        if (!WhisperApiClient.instance) {
            WhisperApiClient.instance = new WhisperApiClient();
        }
        return WhisperApiClient.instance;
    }

    public async transcribe(audioFilePath: string, language: string = "es"): Promise<TranscriptionResultType> {
        try {
            const audioFile = await Deno.readFile(audioFilePath);
            const blob = new Blob([audioFile]);

            const formData = new FormData();
            formData.append("file", blob, "audio.mp4");
            formData.append("model", "whisper-1");
            formData.append("language", language);
            formData.append("response_format", "verbose_json");
            formData.append("temperature", "0");

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            return {
                text: result.text,
                duration: result.duration,
                language: result.language,
                segments: result.segments,
            };
        } catch (error) {
            throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
