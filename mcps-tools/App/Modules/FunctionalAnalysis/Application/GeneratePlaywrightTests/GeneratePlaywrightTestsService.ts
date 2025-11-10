import { ClaudeApiClient } from "App/Modules/FunctionalAnalysis/Infrastructure/Repositories/ClaudeApiClient.ts";

export class GeneratePlaywrightTestsService {

    private static instance: GeneratePlaywrightTestsService | null = null;
    private readonly claudeClient: ClaudeApiClient;

    private constructor() {
        this.claudeClient = ClaudeApiClient.getInstance();
    }

    public static getInstance(): GeneratePlaywrightTestsService {
        if (!GeneratePlaywrightTestsService.instance) {
            GeneratePlaywrightTestsService.instance = new GeneratePlaywrightTestsService();
        }
        return GeneratePlaywrightTestsService.instance;
    }

    public async invoke(acceptanceCriteria: string): Promise<string> {
        const systemPrompt = `Eres un QA automation engineer experto en Playwright y TypeScript.`;

        const userPrompt = `Genera tests Playwright en TypeScript a partir de estos criterios de aceptación en formato BDD (DADO/CUANDO/ENTONCES).

**CRITERIOS DE ACEPTACIÓN:**

${acceptanceCriteria}

---

**INSTRUCCIONES:**
1. Genera código Playwright ejecutable
2. Usa selectores \`data-testid\` (ej: \`page.locator('[data-testid="login-button"]')\`)
3. Incluye comentarios DADO/CUANDO/ENTONCES en el código
4. Usa async/await correctamente
5. Incluye assertions claras con \`expect()\`
6. Agrupa tests relacionados con \`describe()\`

**FORMATO DE SALIDA:**

\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Módulo de Autenticación', () => {

  test('Usuario puede hacer login con credenciales válidas', async ({ page }) => {
    // DADO: Usuario en página de login
    await page.goto('/login');

    // CUANDO: Ingresa credenciales válidas
    await page.locator('[data-testid="email-input"]').fill('user@example.com');
    await page.locator('[data-testid="password-input"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();

    // ENTONCES: Es redirigido al dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  // ... más tests ...

});
\`\`\`

Genera SOLO el código TypeScript, sin explicaciones adicionales.`;

        const responseText = await this.claudeClient.analyze(userPrompt, systemPrompt);

        // Extraer código del response (puede venir envuelto en ```typescript```)
        const codeMatch = responseText.match(/\`\`\`(?:typescript|ts)?\s*([\s\S]*?)\s*\`\`\`/);
        return codeMatch ? codeMatch[1].trim() : responseText.trim();
    }
}
