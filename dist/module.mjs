import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';
import { defu } from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "@flyodev/nitrocms-nuxt3",
    configKey: "flyo"
  },
  defaults: {
    token: process.env.FLYO_TOKEN || ""
  },
  async setup(options, nuxt) {
    if (!options.token) {
      throw new Error("Missing `FLYO_TOKEN` in `.env`");
    }
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime");
    nuxt.options.build.transpile.push(runtimeDir);
    addPlugin(resolve(runtimeDir, "flyo.plugin"));
    nuxt.options.runtimeConfig.public.flyo = defu(nuxt.options.runtimeConfig.flyo, {
      token: options.token
    });
  }
});

export { module as default };
