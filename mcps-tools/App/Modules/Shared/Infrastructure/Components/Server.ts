export class Server {
    static getInstance(): Server {
        return new Server();
    }

    public getServerName(): string {
        return Deno.hostname();
    }

    public async getServerIp(): Promise<string> {
        try {
            const hostname:string = this.getServerName();
            const ips: string[] = await Deno.resolveDns(hostname, "A");
            return Array.isArray(ips) && ips.length > 0 ? ips[0] : "";
        }
        catch {
            return "error";
        }
    }
}