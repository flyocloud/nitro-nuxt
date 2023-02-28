import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import FlyoVue, { useFlyoConfig } from "@flyodev/nitrocms-vue3";
import { useRouter } from "#imports";
export default defineNuxtPlugin(async ({ vueApp }) => {
  const { token, allowEdit, registerPageRoutes } = useRuntimeConfig().flyo;
  vueApp.use(FlyoVue, {
    token,
    allowEdit
  });
  const flyoConfig = useFlyoConfig();
  await flyoConfig.fetch();
  const router = useRouter();
  if (registerPageRoutes) {
    flyoConfig.response.value.pages.forEach((route) => {
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
