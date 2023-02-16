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
    const { resolve } = createResolver(import.meta.url);
    addPlugin(resolve("./runtime/plugin"));
  }
});

export { module as default };
