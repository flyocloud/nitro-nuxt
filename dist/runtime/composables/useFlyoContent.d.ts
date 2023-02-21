export declare const useFlyoContent: (pageId: number) => {
    putContent: (blockUniqueid: string, contentIdentifier: string, newValue: any) => Promise<any>;
    isEditable: () => boolean;
};
