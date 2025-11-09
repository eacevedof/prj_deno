import { MailSentResultType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailSentResultType.ts";

export class MailResult {

    private resultLogs: Record<string, string> = {};

    private sentResult: MailSentResultType = {
        success: false,
        error: "",
        tmpRandomFile: "",
    };

    public static getInstance(): MailResult {
        return new MailResult();
    }

    public async getSentResult(resultLogs: {
        emailLogPath: string;
        tmpTraceLogPath: string;
    }): Promise<MailSentResultType> {

        this.resultLogs = resultLogs;
        this.sentResult.tmpRandomFile = resultLogs.tmpTraceLogPath;

        // Wait for background process to complete
        //await new Promise(resolve => setTimeout(resolve, 2000));

        // Read and parse the trace
        const traceResult: string = await this.getEmailTraceContent();
        this.loadSentResultByTraceResult(traceResult);

        return this.sentResult;
    }

    private async getEmailTraceContent(): Promise<string> {
        try {
            const logContent: string = await Deno.readTextFile(this.resultLogs.emailLogPath);
            const startMarker: string = `[${this.resultLogs.tmpTraceLogPath}][start]`;
            const endMarker: string = `[${this.resultLogs.tmpTraceLogPath}][end]`;

            const startIndex: number = logContent.indexOf(startMarker);
            const endIndex: number = logContent.indexOf(endMarker);

            if (startIndex === -1) return ""; // Start marker not found
            if (endIndex === -1) return logContent.substring(startIndex);

            return logContent.substring(startIndex, endIndex + endMarker.length);
        }
        catch (error) {
            console.error(`Failed to read trace from log file: ${this.resultLogs.emailLogPath}\n`, error);
            return "";
        }
    }

    private loadSentResultByTraceResult(traceResult: string): void {
        if (!traceResult) {
            this.sentResult.error = "No trace result found";
            return;
        }

        const hasStartMarker = traceResult.includes(`[${this.resultLogs.tmpTraceLogPath}][start]`);
        const hasEndMarker = traceResult.includes(`[${this.resultLogs.tmpTraceLogPath}][end]`);

        if (!hasStartMarker) {
            this.sentResult.error = "Email sending process did not start properly";
            return;
        }

        if (!hasEndMarker) {
            this.sentResult.error = "Email sending process did not complete - may still be running or failed";
            return;
        }

        // Check for success indicators in SMTP protocol
        const successIndicators = [
            "< 235 2.0.0 OK",           // Authentication success
            "< 250 2.1.0 Ok",           // MAIL FROM accepted
            "< 250 2.1.5 Ok",           // RCPT TO accepted
            "< 250 2.0.0 Ok: queued"    // Message queued (success)
        ];

        const hasAllSuccessIndicators = successIndicators.every(indicator =>
            traceResult.includes(indicator)
        );

        // Check for common error indicators
        const errorIndicators = [
            "< 5",                      // 5xx SMTP error codes
            "* Connection refused",     // Connection errors
            "* SSL certificate problem", // SSL/TLS errors
            "* Authentication failure", // Auth errors
            "* Timeout",               // Timeout errors
        ];

        const hasErrorIndicators = errorIndicators.some(indicator =>
            traceResult.includes(indicator)
        );

        if (hasAllSuccessIndicators && !hasErrorIndicators) {
            this.sentResult.success = true;
            this.sentResult.error = "";

            const queueMatch = traceResult.match(/< 250 2\.0\.0 Ok: queued as ([^\s\r\n]+)/);
            if (queueMatch) {
                console.log(`Email successfully queued with ID: ${queueMatch[1]}`);
            }
        }
        else {
            // Extract error details
            const traceLines = traceResult.split('\n');
            const errorLines = traceLines.filter(line =>
                line.includes('< 5') ||
                line.includes('* Connection') ||
                line.includes('* SSL') ||
                line.includes('* Authentication') ||
                line.includes('* Timeout')
            );

            this.sentResult.error = traceLines[traceLines.length - 2];
            if (errorLines.length > 0) {
                this.sentResult.error = this.getMinifiedError(errorLines.join('; '));
            }

        }
    }

    private getMinifiedError(error: string): string {
        const lines = error.split("\n");
        const firstLine = lines[0] || error;
        return firstLine.length > 200 ? firstLine.substring(0, 200) + "..." : firstLine;
    }

}