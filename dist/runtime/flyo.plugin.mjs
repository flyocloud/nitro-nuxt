import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { ApiClient, ConfigApi } from "@flyodev/nitrocms-js";
import Block from "@flyodev/nitrocms-vue3";
import Page from "@flyodev/nitrocms-vue3";
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FlyoPage", Page);
  nuxtApp.vueApp.component("FlyoBlock", Block);
  const { token } = useRuntimeConfig().flyo;
  nuxtApp.hook("app:created", (e) => {
    console.log("e", e);
  });
  const defaultClient = ApiClient.instance;
  defaultClient.defaultHeaders = {};
  const ApiKeyAuth = defaultClient.authentications["ApiKeyAuth"];
  ApiKeyAuth.apiKey = token;
  let config = null;
  return {
    provide: {
      flyo: {
        config: async () => {
          try {
            if (!config) {
              config = await new ConfigApi().config();
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
