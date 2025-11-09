export type LoadFromFileType = {
    sourceFile: string;
    sourceFileFormat: string;
    sourceFileDelimiter: string;
    targetTable: string;
    targetColumns: string[];
    includeHeader: boolean;
};
