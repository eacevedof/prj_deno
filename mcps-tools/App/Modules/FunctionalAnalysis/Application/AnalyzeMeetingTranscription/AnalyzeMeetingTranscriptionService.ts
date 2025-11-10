import { ClaudeApiClient } from "App/Modules/FunctionalAnalysis/Infrastructure/Repositories/ClaudeApiClient.ts";

export class AnalyzeMeetingTranscriptionService {

    private static instance: AnalyzeMeetingTranscriptionService | null = null;
    private readonly claudeClient: ClaudeApiClient;

    private constructor() {
        this.claudeClient = ClaudeApiClient.getInstance();
    }

    public static getInstance(): AnalyzeMeetingTranscriptionService {
        if (!AnalyzeMeetingTranscriptionService.instance) {
            AnalyzeMeetingTranscriptionService.instance = new AnalyzeMeetingTranscriptionService();
        }
        return AnalyzeMeetingTranscriptionService.instance;
    }

    public async invoke(transcription: string): Promise<string> {
        const systemPrompt = `Eres un analista funcional experto. Tu tarea es analizar transcripciones de reuniones de toma de requisitos y generar un análisis funcional detallado en formato Markdown.`;

        const userPrompt = `Analiza esta transcripción de reunión y genera un análisis funcional completo siguiendo esta estructura:

# Análisis Funcional: [Título del Proyecto]

## 1. Contexto del Negocio
- ¿Qué problema específico estamos resolviendo?
- ¿Quiénes son los usuarios finales? (roles, perfiles)
- ¿Cuál es el valor de negocio? (KPI esperado)
- ¿Existen restricciones de presupuesto/tiempo?

## 2. Alcance Funcional
- ¿Qué debe hacer el sistema? (happy path)
- ¿Qué NO debe hacer? (exclusiones explícitas)
- ¿Existen dependencias con otros sistemas?
- ¿Hay integraciones externas requeridas?

## 3. Reglas de Negocio
- ¿Cuáles son las validaciones críticas?
- ¿Qué datos son obligatorios vs opcionales?
- ¿Existen flujos condicionales? (if X then Y)
- ¿Hay permisos/roles involucrados?

## 4. Criterios de Aceptación (formato BDD)
Para cada funcionalidad principal, especifica:
- **DADO** [contexto inicial]
- **CUANDO** [acción del usuario]
- **ENTONCES** [resultado esperado]

## 5. Entidades y Datos
- ¿Qué información se captura/muestra?
- ¿De dónde vienen los datos? (fuente)
- ¿Hay transformaciones necesarias?
- ¿Qué se debe persistir?

## 6. Requisitos No Funcionales
- ¿Volumen de datos esperado?
- ¿Concurrencia de usuarios?
- ¿Tiempos de respuesta esperados?
- ¿Requisitos de seguridad?

---

**TRANSCRIPCIÓN DE LA REUNIÓN:**

${transcription}

---

**INSTRUCCIONES:**
- Sé específico y concreto
- Usa el formato BDD (DADO/CUANDO/ENTONCES) para criterios de aceptación
- Si algo no está claro en la transcripción, márcalo como "[A CLARIFICAR]"
- Prioriza las funcionalidades principales
- Genera un documento listo para ser revisado con el equipo`;

        return await this.claudeClient.analyze(userPrompt, systemPrompt);
    }
}
