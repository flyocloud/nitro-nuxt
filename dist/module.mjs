import { defineNuxtModule, createResolver, addPlugin, addImportsDir, extendViteConfig, addComponentsDir } from '@nuxt/kit';
import { defu } from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "@flyodev/nitrocms-nuxt",
    configKey: "flyo"
  },
  defaults: {
    apiToken: process.env.FLYO_API_TOKEN || "",
    apiBasePath: process.env.FLYO_API_BASE_PATH || "",
    registerPageRoutes: true,
    defaultPageRoute: "cms",
    liveEdit: process.env.FLYO_LIVE_EDIT || process.env.NODE_ENV !== "production",
    liveEditOrigin: process.env.FLYO_LIVE_EDIT_ORIGIN || "https://flyo.cloud"
  },
  setup(options, nuxt) {
    if (!options.apiToken) {
      throw new Error("Missing `FLYO_API_TOKEN` in `.env`");
    }
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime");
    nuxt.options.build.transpile.push(runtimeDir);
    addPlugin(resolve(runtimeDir, "flyo.plugin"));
    addImportsDir(resolve(runtimeDir, "composables"));
    extendViteConfig((config) => {
      config.optimizeDeps?.include?.push(
        ...["@flyodev/nitrocms-js"]
      );
    });
    addComponentsDir({ path: "~/flyo", global: true, pathPrefix: false });
    const flyoConfig = defu(nuxt.options.runtimeConfig.flyo, {
      apiToken: options.apiToken,
      apiBasePath: options.apiBasePath,
      registerPageRoutes: options.registerPageRoutes,
      defaultPageRoute: options.defaultPageRoute,
      liveEdit: options.liveEdit,
      liveEditOrigin: options.liveEditOrigin
    });
    if (typeof flyoConfig.liveEdit !== "boolean") {
      flyoConfig.liveEdit = flyoConfig.liveEdit === "true";
    }
    nuxt.options.runtimeConfig.public.flyo = flyoConfig;
  }
});

export { module as default };
