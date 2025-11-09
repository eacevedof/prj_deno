/**
 * Representa un evento del Redis Stream
 *
 * @property id - ID único del evento en el stream (formato: "timestamp-sequence")
 * @property message - Payload del evento con campos clave-valor
 */
export type StreamEventType = {
    id: string;
    message: Record<string, string>;
};
