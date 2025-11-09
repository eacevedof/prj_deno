export class StackTracer {

    public static getCurrentMethod(): string {
        const stack: string | undefined = new Error().stack;
        const stackLines: string[] = stack?.split("\n") || [];
        const callerLine: string | undefined = stackLines[2]?.trim();
        return callerLine?.split(" ")[1] || "unknown";
    }

    public static getCurrentMethodWithClass(): string {
        const stack: string | undefined = new Error().stack;
        const stackLines: string[] = stack?.split("\n") || [];
        const callerLine: string | undefined = stackLines[2]?.trim();

        if (!callerLine) return "unknown";

        const match: RegExpMatchArray | null = callerLine.match(/at\s+([^(]+)/);
        return match ? match[1].trim() : "unknown";
    }

    public static getFullStackTrace(): string[] {
        const stack: string | undefined = new Error().stack;
        return stack?.split("\n").slice(1) || [];
    }

}