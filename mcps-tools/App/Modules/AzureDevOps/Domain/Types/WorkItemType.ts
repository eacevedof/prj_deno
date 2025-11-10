export type WorkItemType = {
    id: number;
    title: string;
    workItemType: "Epic" | "Feature" | "User Story" | "Task" | "Bug";
    state: string;
    description?: string;
    acceptanceCriteria?: string;
    effort?: number;
    url: string;
};

export type CreateEpicRequestType = {
    title: string;
    description: string;
    areaPath?: string;
    iterationPath?: string;
};

export type CreateTaskRequestType = {
    title: string;
    description: string;
    parentId?: number;
    effort?: number;
    areaPath?: string;
    iterationPath?: string;
};

export type WorkItemStructureType = {
    epics: Array<{
        title: string;
        description: string;
        tasks: Array<{
            title: string;
            description: string;
            effort: number;
        }>;
    }>;
};
