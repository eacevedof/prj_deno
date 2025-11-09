export type MailSmtpConfigType = {
    emailFrom: string;
    emailFromName: string;
    protocol: string; // smtp
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpCrypto: string;
    mailType: string; // html
    charset: string; // UTF-8
};
