import { MailProtocolEnum } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailProtocolEnum.ts";
import { MailSentResultType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailSentResultType.ts";
import { MailAttachmentType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailAttachmentType.ts";
import { MailSmtpConfigType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailSmtpConfigType.ts";
import { MailResult } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailResult.ts";

export class Mailer {

    private readonly pathLogEmailFile: string = `${Deno.cwd()}/storage/logs/email-${new Date().toISOString().slice(0, 10)}.log`;
    private readonly defaultTplView: string = Deno.cwd() + "/App/Modules/Mailings/Infrastructure/Views/System/email-default-tpl.html";
    private pathTmpFile: string = "";

    private emailFrom: string = "";
    private emailFromName: string = "";
    private emailTo: string = "";
    private emailsCc: string[] = [];
    private subject: string = "";
    private message: string = "";
    //@todo attachments
    private attachments: MailAttachmentType[] = [];

    private tplView: string = "";
    private tplVars: Record<string, string> = {};

    private smtpConfig: MailSmtpConfigType | null = null;
    private sentResult: MailSentResultType | null = null;

    public static getInstance(): Mailer {
        return new Mailer();
    }

    public setSubject(subject: string): Mailer {
        this.subject = subject;
        return this;
    }

    public setEmailTo(emailTo: string): Mailer {
        this.emailTo = emailTo;
        return this;
    }

    public setEmailFromName(emailFromName: string): Mailer {
        this.emailFromName = emailFromName;
        return this;
    }

    public setEmailFrom(emailFrom: string): Mailer {
        this.emailFrom = emailFrom;
        return this;
    }

    public addEmailCc(emailCC: string): Mailer {
        this.emailsCc.push(emailCC);
        return this;
    }

    public addAttachment(attachment: MailAttachmentType): Mailer {
        this.attachments.push(attachment);
        return this;
    }

    public setAttachments(attachments: MailAttachmentType[]): Mailer {
        this.attachments = attachments;
        return this;
    }

    public setMessage(message: string): Mailer {
        this.message = message;
        return this;
    }

    public setSmtpConfig(smtpConfig: MailSmtpConfigType): Mailer {
        this.smtpConfig = smtpConfig;
        return this;
    }

    public setTplView(tplView: string, tplVars: Record<string, string> = {}): Mailer {
        this.tplView = tplView;
        this.tplVars = tplVars;
        return this;
    }

    public setDefaultTplVars(tplVars: Record<string, string>): Mailer {
        this.tplView = this.defaultTplView;
        this.tplVars = tplVars;
        return this;
    }

    public async sendTemplate(): Promise<Mailer> {

        this.failIfWrongInput();

        this.message = await this.getTemplateHtml();
        await this.sendEmailWithCurl();

        return this;
    }

    private async sendEmailWithCurl(): Promise<void> {

        const emailFrom: string = this.getFromEmailWithAlias();
        const emailTo: string = this.emailTo;
        const subject: string = this.subject || (this.tplVars["subject"] ?? "deno test");
        const timeNow: string = new Date().toISOString();

        let ccHeaders: string = "";
        let ccRecipients: string = "";
        if (this.emailsCc.length > 0) {
            ccHeaders = `Cc: ${this.emailsCc.join(", ")}\n`;
            ccRecipients = this.emailsCc.map(cc => `--mail-rcpt "${cc}"`).join(" ");
        }

        const emailContent: string = `
From: ${emailFrom.trim()}
To: ${emailTo.trim()} ${ccHeaders.trim()}
Subject: ${subject.trim()}
Content-Type: text/html; charset=UTF-8
Date: ${timeNow}

${this.message}
`.trim();

        //console.log("Mailer.emailContent:\n", emailContent);
        const curlSmtpCommand: string =await this.getCurlEmailCommand(
            emailContent,
            ccRecipients
        );
        //console.debug("\ncurlSmtpCommand:\n", curlSmtpCommand, "\n");
        await new Deno.Command("sh", {
            args: ["-c", `echo ${curlSmtpCommand} >> ${this.pathLogEmailFile}`]
        }).output();

        await new Deno.Command("sh", {
            args: ["-c", `echo "[${this.pathTmpFile}][start]" >> ${this.pathLogEmailFile}`]
        }).output();

        await new Deno.Command("sh", {
            args: ["-c", curlSmtpCommand]
        }).output();

        await new Deno.Command("sh", {
            args: ["-c", `echo "[${this.pathTmpFile}][end]" >> ${this.pathLogEmailFile}`]
        }).output();

        this.sentResult = await MailResult.getInstance().getSentResult({
            emailLogPath: this.pathLogEmailFile,
            tmpTraceLogPath: this.pathTmpFile,
        });

    }

    private async getCurlEmailCommand(emailContent: string, ccRecipients:string=""): Promise<string> {
        const mailSmtpConfig: MailSmtpConfigType = this.getDefaultEmailConfig();

        const smtpUrl: string = `${mailSmtpConfig.protocol}://${mailSmtpConfig.smtpHost}:${mailSmtpConfig.smtpPort}`;

        this.pathTmpFile = this.getRandomTmpFilePath();
        await Deno.writeTextFile(this.pathTmpFile, emailContent);

        const nohup: string[] = [
            `nohup sh -c 'curl --verbose --silent --show-error`,
            `--max-time 60`,
            `--url "${smtpUrl}"`,
            `--user "${mailSmtpConfig.smtpUser}:${mailSmtpConfig.smtpPass}"`,
            `--mail-from "${this.emailFrom !== "" ? this.emailFrom : mailSmtpConfig.emailFrom}"`,
            `--mail-rcpt "${this.emailTo}"`,
            ccRecipients,
            `--upload-file ${this.pathTmpFile}`,

            `&& sleep 10 && rm ${this.pathTmpFile}' >> ${this.pathLogEmailFile} 2>&1`, //async
            //`&`, //background async
        ];
        return nohup.join(" ");
    }

    private getDefaultEmailConfig(): MailSmtpConfigType {
        if (this.smtpConfig) return this.smtpConfig;

        //@deuda llevarlo a un enumerado
        return {
            emailFrom: "no-reply@cyberscp.es",
            emailFromName: "Anti mod-name",
            //protocol: MailProtocolEnum.SMTP.valueOf(),
            protocol: MailProtocolEnum.SMTPS.valueOf(),
            smtpHost: "smtp.serviciodecorreo.es",
            smtpPort: 465,
            smtpUser: "no-reply@cyberscp.es",
            smtpPass: "UtYkHG8j!ccFLru7jN5@5tGgM2PzfV6bj6",

            smtpCrypto: "ssl",
            mailType: "html",
            charset: "UTF-8",
        };
    }

    private async getTemplateHtml(): Promise<string> {
        if (!this.tplView) return "";

        let templateContent: string = await Deno.readTextFile(this.tplView);
        for (const [key, value] of Object.entries(this.tplVars)) {
            const placeholder = `{{${key}}}`;
            templateContent = templateContent.replaceAll(placeholder, value);
        }
        return templateContent;
    }

    public getResult(): MailSentResultType  {
        return this.sentResult ?? {success:true, error:"unknown", tmpRandomFile:""};
    }

    public reset(): Mailer {
        this.subject = "";
        this.tplView = "";
        this.tplVars = {};

        this.emailTo = "";
        this.emailFrom = "";
        this.emailFromName = "";
        this.emailsCc = [];
        this.attachments = [];

        this.sentResult = null;
        this.message = "";

        return this;
    }

    private failIfWrongInput(): void {
        if (!this.emailTo) {
            throw new Error("email-to is required");
        }

        if (!this.isValidEmail(this.emailTo)) {
            throw new Error(`email-to ${this.emailTo} is not a valid email`);
        }

        if (!this.subject && Object.keys(this.tplVars).length === 0) {
            throw new Error("subject or vars are required");
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private getEmailFrom(): string {
        return this.emailFrom || this.getDefaultEmailConfig().emailFrom || this.getDefaultEmailConfig().smtpUser;
    }

    private getEmailFromName(): string {
        return this.emailFromName || this.getDefaultEmailConfig().emailFromName || this.getDefaultEmailConfig().smtpUser;
    }

    /**
     * construye el campo from con formato: "Alias Name" <email@domain.com>
     * si no hay alias, devuelve solo el email
     */
    private getFromEmailWithAlias(): string {
        const fromEmail: string = this.getEmailFrom();
        const fromName: string = this.getEmailFromName();

        if (!fromName || fromName === fromEmail) return fromEmail;
        return `"${fromName}" <${fromEmail}>`;
    }

    private getRandomTmpFilePath(): string {
        const today: string = new Date().toISOString().slice(0, 10);
        const now: string = new Date().toISOString().slice(11, 19).replace(/:/g, "");

        const random: string = Array.from(crypto.getRandomValues(new Uint8Array(10)))
            .map(b => b.toString(16).padStart(2, "0")).join("");

        return `/tmp/eml-${today}-${now}-${random}`;
    }

}