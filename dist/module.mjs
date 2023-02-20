import { defineNuxtModule, createResolver, addPlugin, addImportsDir, extendViteConfig, addComponentsDir, addComponent } from '@nuxt/kit';
import { defu } from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "@flyodev/nitrocms-nuxt3",
    configKey: "flyo"
  },
  defaults: {
    token: process.env.FLYO_TOKEN || "",
    registerPageRoutes: true,
    defaultPageRoute: "cms"
  },
  async setup(options, nuxt) {
    if (!options.token) {
      throw new Error("Missing `FLYO_TOKEN` in `.env`");
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
    addComponent({
      name: "FlyoPage",
      // name of the component to be used in vue templates,
      export: "Page",
      filePath: "@flyodev/nitrocms-vue3"
      // resolve(runtimeDir, 'components', 'MyComponent.vue')
    });
    addComponent({
      name: "FlyoBlock",
      // name of the component to be used in vue templates
      export: "Block",
      filePath: "@flyodev/nitrocms-vue3"
      // resolve(runtimeDir, 'components', 'MyComponent.vue')
    });
    nuxt.options.runtimeConfig.public.flyo = defu(nuxt.options.runtimeConfig.flyo, {
      token: options.token,
      registerPageRoutes: options.registerPageRoutes,
      defaultPageRoute: options.defaultPageRoute
    });
  }
});

export { module as default };
