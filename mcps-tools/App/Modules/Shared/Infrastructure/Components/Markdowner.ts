type CodeBlockTmpType = {
    htmlWithTmpCodeTags: string;
    htmlPreAndCodeBlocks: string[];
    htmlInlineCodeBlocks: string[];
};

export class Markdowner {
    public static getInstance(): Markdowner {
        return new Markdowner();
    }

    public getHtmlFromMarkdown(markdown: string): string {
        const codeBlockTmpType: CodeBlockTmpType = this.getCodeTags(markdown);
        //console.log(tmpCodeType);
        let htmlResult: string = this.getATag(codeBlockTmpType.htmlWithTmpCodeTags);

        htmlResult = this.getImgTags(htmlResult);
        htmlResult = this.getH1_H6Tags(htmlResult);
        htmlResult = this.getTextFormattingTags(htmlResult);
        htmlResult = this.getBlockquoteTags(htmlResult);
        htmlResult = this.getHrTags(htmlResult);
        htmlResult = this.getListTags(htmlResult);
        
        // Restaurar código ANTES del procesamiento de párrafos
        htmlResult = this.getRestoredTmpCodeTags(
            htmlResult,
            codeBlockTmpType.htmlInlineCodeBlocks,
            codeBlockTmpType.htmlPreAndCodeBlocks
        );
        
        htmlResult = this.getPTags(htmlResult);
        return htmlResult;
    }

    private getCodeTags(html: string): CodeBlockTmpType {
        // Primero procesar bloques de código para protegerlos
        const codeBlocks: string[] = [];
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match: string, lang: string, code: string): string => {
            const placeholder: string = `XZCODEBLOCKX${codeBlocks.length}XPLACEHOLDERX`;
            const escapedCode: string = code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
            codeBlocks.push(`<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapedCode}</code></pre>`);
            return placeholder;
        });

        // Código en línea (proteger antes que otros procesamientos)
        const inlineCodeBlocks: string[] = [];
        html = html.replace(/`([^`\n]+)`/g, (match: string, code: string): string => {
            const placeholder: string = `XZINLINECODEX${inlineCodeBlocks.length}XPLACEHOLDERX`;
            const escapedCode: string = code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
            inlineCodeBlocks.push(`<code>${escapedCode}</code>`);
            return placeholder;
        });

        return { htmlWithTmpCodeTags: html, htmlPreAndCodeBlocks: codeBlocks, htmlInlineCodeBlocks: inlineCodeBlocks };
    }

    private getATag(html: string): string {
        // Enlaces (antes que el procesamiento de negrita/cursiva)
        return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href=\"$2\">$1</a>");
    }

    private getImgTags(html: string): string {
        // Imágenes
        return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img alt=\"$1\" src=\"$2\">");
    }

    private getH1_H6Tags(html: string): string {
        // Encabezados (niveles 1 a 6)
        for (let i: number = 6; i >= 1; i--) {
            const pattern: RegExp = new RegExp(`^${"#".repeat(i)}\\s+(.*)$`, "gm");
            html = html.replace(pattern, `<h${i}>$1</h${i}>`);
        }
        return html;
    }

    private getTextFormattingTags(html: string): string {
        // Negrita y cursiva combinadas con asteriscos (antes que individuales)
        html = html.replace(/\*\*\*([^\*\n]+)\*\*\*/g, "<strong><em>$1</em></strong>");
        
        // Negrita y cursiva combinadas con underscores (antes que individuales)  
        html = html.replace(/___([^_\n]+)___/g, "<strong><em>$1</em></strong>");
        
        // Negrita con asteriscos
        html = html.replace(/\*\*([^\*\n]+)\*\*/g, "<strong>$1</strong>");
        
        // Negrita con underscores (evitar conflicto con placeholders que contienen __)
        html = html.replace(/(?<!_)__([^_\n]+)__(?!_)/g, "<strong>$1</strong>");
        
        // Cursiva con asteriscos
        html = html.replace(/(?<!\*)\*([^\*\n]+)\*(?!\*)/g, "<em>$1</em>");
        
        // Cursiva con underscores (evitar conflicto con placeholders y negrita)
        html = html.replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");
        
        // Tachado
        html = html.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
        
        return html;
    }

    private getBlockquoteTags(html: string): string {
        // Citas
        return html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");
    }

    private getHrTags(html: string): string {
        // Líneas horizontales
        return html.replace(/^(---|\*\*\*|___)\s*$/gm, "<hr>");
    }

    private getPTags(html: string): string {
        // Separar párrafos por líneas vacías
        html = html.replace(/\n\n+/g, "\n\n");
        const paragraphs: string[] = html.split("\n\n").filter((p: string): boolean => p.trim() !== "");

        const processedParagraphs: string[] = paragraphs.map((paragraph: string): string => {
            const trimmed: string = paragraph.trim();

            // No envolver en <p> si ya es un elemento de bloque
            if (trimmed.startsWith("<h") ||
                trimmed.startsWith("<ul>") ||
                trimmed.startsWith("<ol>") ||
                trimmed.startsWith("<pre>") ||
                trimmed.startsWith("<blockquote>") ||
                trimmed.startsWith("<hr>") ||
                trimmed.includes("<pre><code")) {
                return trimmed;
            }

            // Si la línea no tiene saltos, no agregar <br>
            if (!trimmed.includes("\n")) {
                return `<p>${trimmed}</p>`;
            }

            // Convertir saltos de línea simples en <br>
            const withBreaks: string = trimmed.replace(/\n/g, "<br>");
            return `<p>${withBreaks}</p>`;
        });

        return processedParagraphs.join("\n");
    }

    private getRestoredTmpCodeTags(
        html: string,
        htmlInlineCodeBlocks: string[],
        htmlPreAndCodeBlocks: string[]
    ): string {
        // Restaurar código en línea primero
        htmlInlineCodeBlocks.forEach((codeBlock: string, index: number): void => {
            html = html.replace(`XZINLINECODEX${index}XPLACEHOLDERX`, codeBlock);
        });

        // Restaurar bloques de código
        htmlPreAndCodeBlocks.forEach((codeBlock: string, index: number): void => {
            html = html.replace(`XZCODEBLOCKX${index}XPLACEHOLDERX`, codeBlock);
        });
        return html;
    }

    private getListTags(html: string): string {
        // Listas no ordenadas - procesar línea por línea
        const htmlLines: string[] = html.split("\n");

        let inUList: boolean = false;
        let inOList: boolean = false;
        const processedLines: string[] = [];

        for (let i: number = 0; i < htmlLines.length; i++) {
            const line: string = htmlLines[i];
            const isUListItem: boolean = /^(\s*[-*+])\s+(.*)$/.test(line);
            const isOListItem: boolean = /^\s*\d+\.\s+(.*)$/.test(line);

            if (isUListItem) {
                if (!inUList && inOList) {
                    processedLines.push("</ol>");
                    inOList = false;
                }
                if (!inUList) {
                    processedLines.push("<ul>");
                    inUList = true;
                }
                processedLines.push(line.replace(/^(\s*[-*+])\s+(.*)$/, "<li>$2</li>"));
                continue;
            }
            if (isOListItem) {
                if (!inOList && inUList) {
                    processedLines.push("</ul>");
                    inUList = false;
                }
                if (!inOList) {
                    processedLines.push("<ol>");
                    inOList = true;
                }
                processedLines.push(line.replace(/^\s*\d+\.\s+(.*)$/, "<li>$1</li>"));
                continue;
            }

            if (inUList) {
                processedLines.push("</ul>");
                inUList = false;
            }
            if (inOList) {
                processedLines.push("</ol>");
                inOList = false;
            }
            if (line.trim() !== "") {
                processedLines.push(line);
            }

        }

        // Cerrar listas abiertas
        if (inUList) processedLines.push("</ul>");
        if (inOList) processedLines.push("</ol>");

        return processedLines.join("\n");
    }



}