/**
 * Resolves the page for a given route
 * @see https://stackoverflow.com/a/69208479/4611030
 * @see https://nuxt.com/docs/guide/directory-structure/composables
 * @see https://vuejs.org/guide/reusability/composables.html
 */
export declare function useFlyoPage(slug: string): {
    page: import("vue").Ref<null>;
    error: import("vue").Ref<null>;
};
