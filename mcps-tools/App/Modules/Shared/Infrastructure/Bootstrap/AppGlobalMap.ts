import {AppKeyEnum} from "App/Modules/Shared/Infrastructure/Bootstrap/AppKeyEnum.ts";

export class AppGlobalMap {

    private static instance: AppGlobalMap;
    private static dictionary: Map<string, unknown> = new Map();

    public static getInstance(): AppGlobalMap {
        if (this.instance) return this.instance;

        this.instance = new AppGlobalMap();
        return this.instance;
    }

    public set(key: AppKeyEnum, value: unknown): void {
        AppGlobalMap.dictionary.set(key.valueOf(), value);
    }

    public get(key: AppKeyEnum): unknown {
        if (!AppGlobalMap.dictionary.has(key.valueOf())) return null;

        return AppGlobalMap.dictionary.get(key.valueOf());
    }
}
