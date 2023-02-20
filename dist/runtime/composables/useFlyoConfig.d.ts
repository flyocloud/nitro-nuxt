/**
 * @see https://stackoverflow.com/a/69208479/4611030
 * @see https://nuxt.com/docs/guide/directory-structure/composables
 * @see https://vuejs.org/guide/reusability/composables.html
 */
export declare const useFlyoConfig: () => {
    fetchConfig: () => Promise<any>;
    config: import("vue").Ref<boolean>;
    loading: import("vue").Ref<boolean>;
};
