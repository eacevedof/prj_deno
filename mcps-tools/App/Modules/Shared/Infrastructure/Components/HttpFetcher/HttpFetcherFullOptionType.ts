export type HttpFetcherFullOptionType = {
    method?: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    timeout?: number;
    isUrlEncoded?: boolean;
};