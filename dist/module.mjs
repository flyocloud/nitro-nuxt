import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "flyo",
    configKey: "flyo"
  },
  defaults: {
    token: ""
  },
  async setup(moduleOptions, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    addPlugin(resolve("./runtime/plugin"));
  }
});

export { module as default };
