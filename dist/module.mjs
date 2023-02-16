import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "@flyodev/nitrocms-nuxt3",
    configKey: "flyo"
  },
  defaults: {
    token: process.env.FLYO_TOKEN
  },
  async setup(options, nuxt) {
    if (!options.token) {
      throw new Error("Missing `FLYO_TOKEN` in `.env`");
    }
    const { resolve: resolve2 } = createResolver(import.meta.url);
    const runtimeDir = resolve2("./runtime");
    nuxt.options.build.transpile.push(runtimeDir);
    addPlugin(resolve2(runtimeDir, "flyo.plugin"));
  }
});

export { module as default };
