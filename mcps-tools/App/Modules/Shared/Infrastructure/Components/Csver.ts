import { parse, stringify } from "jsr:@std/csv";

export class Csver {

    public static getInstance(): Csver {
        return new Csver();
    }

    public async createCsvFileFromArray(
        data: Record<string, string | number |null>[],
        filePath: string,
        delimiter: string = ",",
        headers?: string[],
    ): Promise<void> {

        if (!headers) {
            headers = Object.keys(data[0] || {});
        }
        const cleanData = data.map(row =>
            Object.fromEntries(
                Object.entries(row).map(([k, v]) => [
                    k,
                    //quita los caracteres nulos de las cadenas que dan problemas: tr -cd '\0' < /tmp/domains.csv | wc -c
                    typeof v === "string" ? v.replace(/\0/g, "") : v
                ])
            )
        );

        const csvContent: string = stringify(cleanData, {
            //@ts-ignore
            header: false,
            columns: headers,
            delimiter: delimiter,
        });
        //@ts-ignore
        await Deno.writeTextFile(filePath, csvContent, { encoding: "utf8" });
    }
}