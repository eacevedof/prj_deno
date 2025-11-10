export type WikiPageType = {
    id: string;
    path: string;
    content: string;
    url: string;
    createdDate?: string;
    modifiedDate?: string;
};

export type CreateWikiPageRequestType = {
    path: string;
    content: string;
};
