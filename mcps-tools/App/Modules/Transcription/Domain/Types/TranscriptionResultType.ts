export type TranscriptionResultType = {
    text: string;
    duration?: number;
    language?: string;
    segments?: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
    }>;
};
