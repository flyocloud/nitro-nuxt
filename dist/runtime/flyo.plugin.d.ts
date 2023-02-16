declare const _default: import("nuxt/app").Plugin<{
    flyo: {
        getConfig: () => Promise<null>;
        isEditAllowed: () => boolean;
        updateContent(newValue: any, contentIdentifier: any, uid: any, pageId: any): Promise<any>;
        configApi: any;
        pagesApi: any;
        entitiesApi: any;
        sitemapApi: any;
        contentApi: any;
    };
}>;
export default _default;
