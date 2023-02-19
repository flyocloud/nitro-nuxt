import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { ApiClient } from "@flyodev/nitrocms-js";
import Block from "@flyodev/nitrocms-vue3";
import Page from "@flyodev/nitrocms-vue3";
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FlyoPage", Page);
  nuxtApp.vueApp.component("FlyoBlock", Block);
  const { token } = useRuntimeConfig().flyo;
  nuxtApp.hook("app:created", () => {
    console.log(ApiClient);
  });
  console.log(token);
  let config = null;
  return {
    provide: {
      flyo: {
        getConfig: async () => {
          try {
            if (!config) {
              config = await new ConfigApi().configApi.config();
            }
            return config;
          } catch (e) {
            console.error(e);
            return null;
          }
        }
      }
    }
  };
});
