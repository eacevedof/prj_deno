export enum McpToolNameEnum {
    TRANSCRIBE_AND_ANALYZE = "transcribe_and_analyze",
    WIKI_TO_WORKITEMS = "wiki_to_workitems",
    CRITERIA_TO_PLAYWRIGHT = "criteria_to_playwright",
}

export type McpToolArgumentsType = {
    // For transcribe_and_analyze
    audio_path?: string;
    wiki_path?: string;

    // For wiki_to_workitems
    wiki_page_id?: string;
    project_name?: string;

    // For criteria_to_playwright
    epic_id?: string;
    acceptance_criteria?: string;
    output_path?: string;
};
