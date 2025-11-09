import { CliColor as cli} from "App/Modules/Shared/Infrastructure/Components/Cli/CliColor.ts";

import { InterfaceConsole } from "App/Console/InterfaceConsole.ts";
import { AbstractCommand } from "App/Console/Commands/AbstractCommand.ts";

import { Mailer } from "App/Modules/Shared/Infrastructure/Components/Mailer/Mailer.ts";
import { MailSentResultType } from "App/Modules/Shared/Infrastructure/Components/Mailer/MailSentResultType.ts";

import { SendAlertEmailService } from "App/Modules/Mailings/Application/SendAlertEmail/SendAlertEmailService.ts";

/**
 * deno task check-email
 */
export default class CheckEmailCommand extends AbstractCommand implements InterfaceConsole {

    constructor() {
        super();
    }

    public static getInstance(): CheckEmailCommand {
        return new CheckEmailCommand();
    }

    public async invoke(): Promise<void> {
        this.echoStart("CheckEmailCommand");
        try {
            await this.sendAlertEmailService();
            //await this.testEmailSending();
            //await this.testEmailSendingCC();
        }
        catch (error) {
            this.logger.logException(error);
            cli.dieRed(error.stack ?? error);
        }
        this.echoEnd("CheckEmailCommand");
    }

    private async sendAlertEmailService(): Promise<void> {
        const sendAlertEmailService: SendAlertEmailService = SendAlertEmailService.getInstance();
        await sendAlertEmailService.invoke(
            new Error("Test error from CheckEmailCommand"),
            "Test error from CheckEmailCommand"
        );
    }

    private async testEmailSending(): Promise<void> {
        const mailer: Mailer = Mailer.getInstance()
            .setEmailTo("userexam@example.ex")
            .setSubject("Email Test from Some-App-Xxx Service")
            .setDefaultTplVars({
                subject: "Email Configuration Test ✅",
                body: `
                    <h2 style="color:green">Email Configuration Test ✅</h2>
                    <p>This is a test email from the Some-App-Xxx microservice.</p>
                    <p><strong>SMTP Configuration:</strong></p>
                    <p>If you receive this email, the SMTP configuration is working correctly.</p>
                    <p><em>Generated at: ${new Date().toISOString()}</em></p>
                `
            });

        this.echoStep("Sending test email...");
        await mailer.sendTemplate();
        const sendResult: MailSentResultType = mailer.getResult();

        if (sendResult.success) {
            cli.echoGreen("✅ Email sent successfully!");
            return;
        }

        cli.echoRed("❌ Email sending failed!");
        cli.echoRed(`Error: ${sendResult.error}, log-section:${sendResult.tmpRandomFile}`);

    }

    private async testEmailSendingCC(): Promise<void> {
        const mailer: Mailer = Mailer.getInstance()
            .setEmailTo("userexam@example.ex")
            .addEmailCc("development@example.ex")
            .setSubject("Email Test from Some-App-Xxx Service with CC")
            .setDefaultTplVars({
                subject: "Email Configuration Test with CC ✅",
                body: `
<h2 style="color:green">Email Configuration Test with CC ✅</h2>
<p>This is a test email from the Some-App-Xxx microservice.</p>
<p><strong>Recipients:</strong></p>
<ul>
    <li><strong>To:</strong> userexam@example.ex</li>
    <li><strong>CC:</strong> development@example.ex</li>
</ul>
<p><strong>SMTP Configuration:</strong></p>
<ul>
    <li>Host: smtp.serviciodecorreo.es</li>
    <li>Port: 465 (SMTPS)</li>
    <li>From: no-reply@cyberscp.es</li>
    <li>Protocol: Secure SMTP over SSL</li>
</ul>
<p>If both recipients receive this email, the CC functionality is working correctly.</p>
<p><em>Generated at: ${new Date().toISOString()}</em></p>
<p><em>Microservice: Some-App-Xxx API v1.0</em></p>
                `
            });

        await mailer.sendTemplate();
        const sendResult: MailSentResultType = mailer.getResult();

        if (sendResult.success) {
            cli.echoGreen("✅ Email sent successfully with CC!");
            this.echoStep(`Log trace: ${sendResult.tmpRandomFile}`);
            return;
        }

        cli.echoRed("❌ Email sending failed!");
        cli.echoRed(`Error: ${sendResult.error}, log-section:${sendResult.tmpRandomFile}`);

    }

}