import { HttpFetcherFullOptionType } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcherFullOptionType.ts";
import { HttpFetcherResponseType } from "App/Modules/Shared/Infrastructure/Components/HttpFetcher/HttpFetcherResponseType.ts";

export class HttpFetcher {
    
    private readonly oneHundredTwentySeconds: number = 120000; // 120 seconds like PHP version
    private readonly thirtySeconds : number = 30000; // 30 seconds like PHP version

    public static getInstance(): HttpFetcher {
        return new HttpFetcher();
    }

    public async httpGet(
        requestUrl: string, 
        requestHeaders?: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        return await this.customHttpRequest(requestUrl, {
            method: "GET",
            headers: requestHeaders,
            timeout: this.oneHundredTwentySeconds
        });
    }

    public async httpPost(
        requestUrl: string, 
        requestBody: Record<string, unknown>,
        requestHeaders?: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        const fullCustomOptions: HttpFetcherFullOptionType = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...requestHeaders
            },
            body: requestBody,
            isUrlEncoded: false,
            timeout: this.oneHundredTwentySeconds
        };

        //console.log("\nHttpFetcher.httpPost:",fullCustomOptions)

        return await this.customHttpRequest(
            requestUrl,
            fullCustomOptions
        );
    }

    public async httpPostByURLSearchParams(
        requestUrl: string, 
        requestBody: URLSearchParams,
        requestHeaders?: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        // Convert URLSearchParams to object for internal handling
        const postBody: Record<string, unknown> = {};
        requestBody.forEach((value, key) => {
            postBody[key] = value;
        });

        const fullCustomOptions: HttpFetcherFullOptionType = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...requestHeaders
            },
            body: postBody,
            isUrlEncoded: true,
            timeout: this.oneHundredTwentySeconds
        };

        //console.log("\nHttpFetcher.httpPostByURLSearchParams:",fullCustomOptions)

        return await this.customHttpRequest(
            requestUrl,
            fullCustomOptions
        );
    }

    public async httpGetWithHeaders(
        requestUrl: string, 
        requestHeaders: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        return await this.customHttpRequest(requestUrl, {
            method: "GET",
            headers: requestHeaders,
            timeout: this.thirtySeconds
        });
    }

    public async httpGetWithBody(
        requestUrl: string, 
        requestBody: Record<string, unknown>, 
        requestHeaders?: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        return await this.customHttpRequest(requestUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...requestHeaders
            },
            body: requestBody,
            timeout: this.oneHundredTwentySeconds
        });
    }

    public async httpGetStatus(
        requestUrl: string, 
        requestHeaders?: Record<string, string>
    ): Promise<HttpFetcherResponseType> {
        return await this.customHttpRequest(requestUrl, {
            method: "HEAD", // Equivalent to CURLOPT_NOBODY in PHP
            headers: requestHeaders,
            timeout: 30000
        });
    }

    public async httpAnyByCustomOptions(
        requestUrl: string,
        requestCustomOptions: HttpFetcherFullOptionType
    ): Promise<HttpFetcherResponseType> {
        return await this.customHttpRequest(requestUrl, {
            timeout: this.oneHundredTwentySeconds,
            ...requestCustomOptions
        });
    }

    private async customHttpRequest(
        requestUrl: string,
        httpFetcherFullOptions: HttpFetcherFullOptionType
    ): Promise<HttpFetcherResponseType> {

        const abortController: AbortController = new AbortController();
        const timeoutId: number = setTimeout(
            () => abortController.abort(),
            httpFetcherFullOptions.timeout ?? this.oneHundredTwentySeconds
        );

        try {
            let fetchBody: string | undefined;
            
            if (httpFetcherFullOptions.body) {
                fetchBody = JSON.stringify(httpFetcherFullOptions.body);
                if (httpFetcherFullOptions.isUrlEncoded) {
                    const urlSearchParams: URLSearchParams = new URLSearchParams();
                    Object.entries(httpFetcherFullOptions.body).forEach(([key, value]) => {
                        urlSearchParams.append(key, String(value));
                    });
                    fetchBody = urlSearchParams.toString();
                }
            }

            const response: Response = await fetch(requestUrl, {
                method: httpFetcherFullOptions.method ?? "GET",
                headers: httpFetcherFullOptions.headers,
                body: fetchBody,
                signal: abortController.signal
            });

            clearTimeout(timeoutId);

            const responseText: string = await response.text();
            return {
                url: requestUrl,
                status_code: response.status,
                error: null,
                response: responseText
            } as HttpFetcherResponseType;
        }
        catch (error: unknown) {
            clearTimeout(timeoutId);
            let errorMessage: string = "Unknown error occurred";
            let statusCode: number = 500;

            if (error instanceof Error) {
                errorMessage = error.name === "AbortError" ? "Request timeout" : error.message;
                statusCode = error.name !== "AbortError" ? 520 : 408;
            }

            return {
                url: requestUrl,
                status_code: statusCode,
                error: errorMessage,
                response: null
            } as HttpFetcherResponseType;
        } //catch

    } //executeRequest

}