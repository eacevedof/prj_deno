import { EnvKeyEnum, getEnv } from "App/Modules/Shared/Infrastructure/Enums/EnvKeyEnum.ts";

export class ClaudeApiClient {

    private static instance: ClaudeApiClient | null = null;
    private readonly apiKey: string;
    private readonly apiUrl: string = "https://api.anthropic.com/v1/messages";
    private readonly model: string = "claude-sonnet-4-20250514";

    private constructor() {
        this.apiKey = getEnv(EnvKeyEnum.ANTHROPIC_API_KEY) ?? "";
        if (!this.apiKey) {
            throw new Error("ANTHROPIC_API_KEY not found in environment variables");
        }
    }

    public static getInstance(): ClaudeApiClient {
        if (!ClaudeApiClient.instance) {
            ClaudeApiClient.instance = new ClaudeApiClient();
        }
        return ClaudeApiClient.instance;
    }

    public async analyze(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const requestBody: Record<string, unknown> = {
                model: this.model,
                max_tokens: 8000,
                messages: [{
                    role: "user",
                    content: prompt,
                }],
            };

            if (systemPrompt) {
                requestBody.system = systemPrompt;
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Claude API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result.content && result.content.length > 0 && result.content[0].type === "text") {
                return result.content[0].text;
            }

            throw new Error("Unexpected response format from Claude API");
        } catch (error) {
            throw new Error(`Failed to analyze with Claude: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
