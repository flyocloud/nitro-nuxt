import { useRouter, defineNuxtPlugin, useRuntimeConfig } from "#imports";
import { useFlyoConfig } from "./composables/useFlyoConfig.mjs";
import FlyoVue from "@flyo/nitro-vue3";
export default defineNuxtPlugin(async ({ vueApp }) => {
  const { apiToken, apiBasePath, liveEdit, liveEditOrigin, registerPageRoutes } = useRuntimeConfig().public.flyo;
  vueApp.use(FlyoVue, {
    apiToken,
    apiBasePath,
    liveEdit,
    liveEditOrigin
  });
  const { response: config } = await useFlyoConfig();
  const router = useRouter();
  if (registerPageRoutes) {
    config.pages.forEach((route) => {
      router.addRoute(
        {
          name: `${route}`,
          path: `/${route}`,
          component: () => import("~/pages/cms.vue")
          // using ${defaultPageRoute} does not work
        }
      );
    });
  }
});
