import {Replacer} from "App/Modules/Shared/Infrastructure/Components/Replacer.ts";

export abstract class AbstractView {

    private replacer: Replacer = Replacer.getInstance();

    protected renderBodyContent(bodyContent: string): string {
        return this.getHeader() + this.getBody(bodyContent) + this.getFooter();
    }

    protected getHeader(): string {
        return `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Lazarus Anti mod-name API</title>
    <link rel="alternate icon" type="image/png" href="https://example.ex/assets/imgs/template/favicon.png">
    <link rel="stylesheet" href="/assets/Modules/Documentation/Css/documentation.css">
    </head>
    `;
    }

    protected getBody(htmlBody: string): string {
        return `
    <body>
    ${htmlBody}
    </body>
    `;
    }

    protected getFooter(): string {
        return `
    <footer></footer>
    </html>
    `;
    }

    protected getReplacedContent(
        content: string,
        toReplace: Record<string, string>
    ): string {
        return this.replacer.getReplacedContent(content, toReplace);
    }

}