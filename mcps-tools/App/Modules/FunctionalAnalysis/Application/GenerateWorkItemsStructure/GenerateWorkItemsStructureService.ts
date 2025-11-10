import { ClaudeApiClient } from "App/Modules/FunctionalAnalysis/Infrastructure/Repositories/ClaudeApiClient.ts";
import { WorkItemStructureType } from "App/Modules/AzureDevOps/Domain/Types/WorkItemType.ts";

export class GenerateWorkItemsStructureService {

    private static instance: GenerateWorkItemsStructureService | null = null;
    private readonly claudeClient: ClaudeApiClient;

    private constructor() {
        this.claudeClient = ClaudeApiClient.getInstance();
    }

    public static getInstance(): GenerateWorkItemsStructureService {
        if (!GenerateWorkItemsStructureService.instance) {
            GenerateWorkItemsStructureService.instance = new GenerateWorkItemsStructureService();
        }
        return GenerateWorkItemsStructureService.instance;
    }

    public async invoke(functionalAnalysis: string): Promise<WorkItemStructureType> {
        const systemPrompt = `Eres un Product Owner experto que convierte análisis funcionales en épicas y tareas ejecutables.`;

        const userPrompt = `Convierte este análisis funcional en una estructura de épicas y tareas para Azure DevOps.

**ANÁLISIS FUNCIONAL:**

${functionalAnalysis}

---

**INSTRUCCIONES:**
1. Crea épicas por módulo/funcionalidad principal
2. Cada épica debe tener:
   - Título claro (50 caracteres máx)
   - Descripción detallada
   - Lista de tareas hijas

3. Cada tarea debe tener:
   - Título específico (ej: "Implementar endpoint POST /api/users")
   - Descripción con contexto técnico
   - Estimación de esfuerzo (1-8 horas)

4. Incluye tareas de:
   - Desarrollo backend/frontend
   - Tests E2E (por cada criterio de aceptación)
   - Documentación técnica

**FORMATO DE SALIDA (JSON estricto):**

\`\`\`json
{
  "epics": [
    {
      "title": "Módulo de Autenticación",
      "description": "Implementar sistema de login con JWT...",
      "tasks": [
        {
          "title": "Crear endpoint POST /auth/login",
          "description": "Implementar lógica de validación de credenciales...",
          "effort": 5
        },
        {
          "title": "Test E2E: Usuario puede hacer login",
          "description": "Implementar test Playwright basado en criterio de aceptación...",
          "effort": 3
        }
      ]
    }
  ]
}
\`\`\`

Retorna SOLO el JSON, sin texto adicional.`;

        const responseText = await this.claudeClient.analyze(userPrompt, systemPrompt);

        // Extraer JSON del response (puede venir envuelto en ```json```)
        const jsonMatch = responseText.match(/\`\`\`(?:json)?\s*(\{[\s\S]*?\})\s*\`\`\`/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;

        try {
            return JSON.parse(jsonString.trim());
        } catch (error) {
            throw new Error(`Failed to parse work items structure: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
