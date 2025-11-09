import { EnvironmentEnum } from "App/Modules/Shared/Infrastructure/Enums/EnvironmentEnum.ts";

import { DateTimer } from "App/Modules/Shared/Infrastructure/Components/DateTimer.ts";
import { Logger } from "App/Modules/Shared/Infrastructure/Components/Logger/Logger.ts";
import { Mailer } from "App/Modules/Shared/Infrastructure/Components/Mailer/Mailer.ts";
import { MailSentResultType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailSentResultType.ts";
import { Server } from "App/Modules/Shared/Infrastructure/Components/Server.ts";

import { EnvironmentReaderRawRepository } from "App/Modules/Shared/Infrastructure/Repositories/Configuration/EnvironmentReaderRawRepository.ts";

import { SysUserEmailEnum } from "App/Modules/Users/Domain/Enums/SysUserEmailEnum.ts";

export class SendAlertEmailService {

    private readonly dateTimer: DateTimer = DateTimer.getInstance();
    private readonly server: Server = Server.getInstance();
    private readonly environmentRawRepository: EnvironmentReaderRawRepository;
    private readonly emailTo: string;

    private constructor() {
        this.environmentRawRepository = EnvironmentReaderRawRepository.getInstance();
        this.emailTo = this.environmentRawRepository.isProduction()
            ? SysUserEmailEnum.DEVELOPMENT_EMAIL
            : this.environmentRawRepository.getAlertEmailTo();
    }

    public static getInstance(): SendAlertEmailService {
        return new SendAlertEmailService();
    }

    public invoke(error: Error, title: string): void {
        if (!this.emailTo) {
            this.logEmail("No emailTo configured", "invoke");
            return;
        }

        const appName: string = this.getCleanAppName();
        const environment: EnvironmentEnum = this.environmentRawRepository.getEnvironment();
        const serverInfo: string = this.server.getServerName();
        const subject: string = `[alert]: (${environment.valueOf()}) - SendAlertEmailService.invoke`;
        const now: string = this.dateTimer.getNowYmdHis();
        const htmlBody: string = this.getHtmlErrorBody(title, error, now);

        const mailer: Mailer = Mailer.getInstance()
            .setEmailTo(this.emailTo)
            .setEmailFromName(`${appName} (${environment.valueOf()})`)
            .setSubject(subject)
            .setDefaultTplVars({
                subject: `${serverInfo} ${subject}`,
                body: htmlBody,
            });

        mailer.sendTemplate()
            .then(() => {
                const sendResult: MailSentResultType = mailer.getResult();
                this.logEmail(sendResult, "invoke");
            })
            .catch((e: unknown) => {
                this.logEmail(this.getErrorToString(e), "invoke");
            });
    }

    public sendSecurityThreatAlert(message: string): void {
        if (!this.emailTo) {
            this.logEmail("No emailTo configured", "sendSecurityThreatAlert");
            return;
        }

        const appName: string = this.getCleanAppName();
        const environment: EnvironmentEnum = this.environmentRawRepository.getEnvironment();
        const serverInfo: string = this.server.getServerName();
        const subject: string = `[alert]: (${environment.valueOf()}) - Security Threat`;
        const now: string = this.dateTimer.getNowYmdHis();
        const htmlBody: string = this.getHtmlSecurityAlertBody(message, now);

        const mailer: Mailer = Mailer.getInstance()
            .setEmailTo(this.emailTo)
            .setEmailFromName(`${appName} (${environment.valueOf()})`)
            .setSubject(subject)
            .setDefaultTplVars({
                subject: `${serverInfo} ${subject}`,
                body: htmlBody,
            });

        mailer.sendTemplate()
            .then(() => {
                const sendResult: MailSentResultType = mailer.getResult();
                this.logEmail(sendResult, "sendSecurityThreatAlert");
            })
            .catch((e: unknown) => {
                this.logEmail(this.getErrorToString(e), "sendSecurityThreatAlert");
            });
    }

    public sendWarning(message: string): void {
        if (!this.emailTo) {
            this.logEmail("No emailTo configured", "sendWarning");
            return;
        }

        const appName: string = this.getCleanAppName();
        const environment: EnvironmentEnum = this.environmentRawRepository.getEnvironment();
        const serverInfo: string = this.server.getServerName();
        const subject: string = `[alert]: (${environment.valueOf()}) - Warning`;
        const now: string = this.dateTimer.getNowYmdHis();
        const htmlBody: string = this.getHtmlWarningBody(message, now);

        const mailer: Mailer = Mailer.getInstance()
            .setEmailTo(this.emailTo)
            .setEmailFromName(`${appName} (${environment.valueOf()})`)
            .setSubject(subject)
            .setDefaultTplVars({
                subject: `${serverInfo} ${subject}`,
                body: htmlBody,
            });

        mailer.sendTemplate()
            .then(() => {
                const sendResult: MailSentResultType = mailer.getResult();
                this.logEmail(sendResult, "sendWarning");
            })
            .catch((e: unknown) => {
                this.logEmail(this.getErrorToString(e), "sendWarning");
            });
    }

    private getHtmlErrorBody(title: string, error: Error, now: string): string {
        const baseUrl: string = this.environmentRawRepository.getBaseUrl();
        const kibanaUrl: string = "https://kibana.examplebsntechdev.com/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now%2Fd,to:now%2Fd))&_a=(columns:!(log_content,request_uri),filters:!(),index:'4522cff0-8443-11f0-bdd8-6b65a9dd16da',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))";

        return `
        <h3 style="color:#D60202FF;">[${now}] ${title}</h3>
        <p><a href="${baseUrl}" target="_blank">${baseUrl}</a></p>
        <p>
            <a href="${kibanaUrl}">
                Kibana
            </a>
        </p>
        <b>File:</b>
        <pre style="color:#D60202FF">${error.stack || "No stack trace available"}</pre>

        <br/><b>Message:</b>
        <pre>${error.message}</pre>

        <br/><b>Error Name:</b>
        <pre>${error.name}</pre>
        `.trim();
    }

    private getHtmlSecurityAlertBody(message: string, now: string): string {
        const baseUrl: string = this.environmentRawRepository.getBaseUrl();
        const kibanaUrl: string = "https://kibana.examplebsntechdev.com/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now%2Fd,to:now%2Fd))&_a=(columns:!(log_content,request_uri),filters:!(),index:'4522cff0-8443-11f0-bdd8-6b65a9dd16da',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))";
        const htmlMessage: string = message.replace(/\n/g, "<br/>");

        return `
        <h3 style="color:#D60202FF;">[${now}] Security Threat Alert</h3>
        <p><a href="${baseUrl}" target="_blank">${baseUrl}</a></p>
        <p>
            <a href="${kibanaUrl}">
                Kibana
            </a>
        </p>
        <br/><b>Security Alert Details:</b>
        <pre>${htmlMessage}</pre>
        `.trim();
    }

    private getHtmlWarningBody(message: string, now: string): string {
        const baseUrl: string = this.environmentRawRepository.getBaseUrl();
        const kibanaUrl: string = "https://kibana.examplebsntechdev.com/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now%2Fd,to:now%2Fd))&_a=(columns:!(log_content,request_uri),filters:!(),index:'4522cff0-8443-11f0-bdd8-6b65a9dd16da',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))";
        return `
        <h3 style="color:darkorange;">[${now}] Warning</h3>
        <p><a href="${baseUrl}" target="_blank">${baseUrl}</a></p>
        <p>
            <a href="${kibanaUrl}">
                Kibana
            </a>
        </p>

        <br/><b>Warning Details:</b>
        ${message}
        `.trim();
    }

    private getCleanAppName(): string {
        const appName: string = this.environmentRawRepository.getAppName();
        return appName.replace(/"/g, "");
    }

    private logEmail(content: string | Error | MailSentResultType, method: string): void {

        let logContent: string;
        if (content instanceof Error) {
            logContent = `${content.name}: ${content.message}\n${content.stack}`;
            Logger.getInstance().logDebug(`[${method}] ${logContent}`);
            return;
        }

        if (typeof content === "object" && "success" in content) {
            const result = content as MailSentResultType;
            logContent = result.success
                ? `Email sent successfully. Trace: ${result.tmpRandomFile}`
                : `Email failed. Error: ${result.error}, Trace: ${result.tmpRandomFile}`;
            Logger.getInstance().logDebug(`[${method}] ${logContent}`);
            return;
        }

        logContent = String(content);
        Logger.getInstance().logDebug(`[${method}] ${logContent}`);
    }

    private getErrorToString(error: unknown): string {
        return error instanceof Error
            ? error.message
            : String(error)
    }

}