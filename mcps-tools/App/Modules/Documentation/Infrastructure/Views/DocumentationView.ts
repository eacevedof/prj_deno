import { dirname, fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Markdowner } from "App/Modules/Shared/Infrastructure/Components/Markdowner.ts";

import { AbstractView } from "App/Modules/Shared/Infrastructure/Views/AbstractView.ts";

import { DocumentationViewDto } from "App/Modules/Documentation/Infrastructure/Views/DocumentationViewDto.ts";

export class DocumentationView extends AbstractView {

    private documentationViewDto!: DocumentationViewDto;

    public static getInstance(): DocumentationView {
        return new DocumentationView();
    }

    public async invoke(documentationViewDto: DocumentationViewDto): Promise<string> {
        this.documentationViewDto = documentationViewDto;

        const thisViewDir: string = dirname(fromFileUrl(import.meta.url));
        const mdFile: string = `${thisViewDir}/documentation.md`;

        let markdownContent: string = await Deno.readTextFile(mdFile);
        markdownContent = this.getReplacedContent(markdownContent, {
            "{{appVersion}}": this.documentationViewDto.getAppVersion(),
            "{{appVersionUpdate}}": this.documentationViewDto.getAppVersionUpdate(),
            "{{appBaseUrl}}": this.documentationViewDto.getAppBaseUrl(),
        });

        const htmlBody: string = Markdowner.getInstance().getHtmlFromMarkdown(markdownContent);
        return this.renderBodyContent(htmlBody);
    }

}

