import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    /**
     * Flyo Nitro CMS Auth Token
     * @default process.env.FLYO_TOKEN
     * @type string
     */
    token: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { ModuleOptions, _default as default };
