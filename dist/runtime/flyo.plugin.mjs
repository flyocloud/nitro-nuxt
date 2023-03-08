import { useRouter, defineNuxtPlugin, useRuntimeConfig } from "#imports";
import { useFlyoConfig } from "./composables/useFlyoConfig.mjs";
import FlyoVue from "@flyodev/nitrocms-vue3";
export default defineNuxtPlugin(async ({ vueApp }) => {
  const { apiToken, apiBasePath, liveEdit, liveEditOrigin, registerPageRoutes } = useRuntimeConfig().flyo;
  vueApp.use(FlyoVue, {
    apiToken,
    apiBasePath,
    liveEdit,
    // renamed from allowEdit to liveEdit, but not yet in vue3 plugin
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
