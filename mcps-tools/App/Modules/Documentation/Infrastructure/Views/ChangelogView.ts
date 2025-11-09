import { dirname, fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Markdowner } from "App/Modules/Shared/Infrastructure/Components/Markdowner.ts";
import { AbstractView } from "App/Modules/Shared/Infrastructure/Views/AbstractView.ts";
import {DocumentationViewDto} from "App/Modules/Documentation/Infrastructure/Views/DocumentationViewDto.ts";

export class ChangelogView extends AbstractView{

    private documentationViewDto!: DocumentationViewDto;

    public static getInstance(): ChangelogView {
        return new ChangelogView();
    }

    public async invoke(documentationViewDto: DocumentationViewDto): Promise<string> {
        this.documentationViewDto = documentationViewDto;

        let changelogMdContent: string = await this.getChangelogMdContent();
        changelogMdContent = this.getReplacedContent(changelogMdContent, {
            "{{appVersion}}": this.documentationViewDto.getAppVersion(),
            "{{appVersionUpdate}}": this.documentationViewDto.getAppVersionUpdate(),
            "{{appBaseUrl}}": this.documentationViewDto.getAppBaseUrl(),
        });

        const htmlContent: string = Markdowner.getInstance().getHtmlFromMarkdown(changelogMdContent);
        return this.renderBodyContent(htmlContent);
    }

    private async getChangelogMdContent(): Promise<string> {
        try {
            const thisViewDir: string = dirname(fromFileUrl(import.meta.url));
            const changelogPath: string = `${thisViewDir}/changelog.md`;
            const mdContent: string =  await Deno.readTextFile(changelogPath);
            return mdContent.trim();
        }
        catch (error) {
            console.error("Error reading changelog.md:", error);
            return "#### Error\n- No se pudo cargar el changelog\n- Path error: " + error.message;
        }
    }

}