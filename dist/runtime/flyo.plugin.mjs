import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import FlyoVue, { useFlyoConfig } from "@flyodev/nitrocms-vue3";
import { useRouter } from "#imports";
export default defineNuxtPlugin(async ({ vueApp }) => {
  const { token, allowEdit, registerPageRoutes } = useRuntimeConfig().flyo;
  vueApp.use(FlyoVue, {
    token,
    allowEdit
  });
  const { fetchConfig } = useFlyoConfig();
  console.log("nuxt plugin fetch config");
  const config = await fetchConfig();
  console.log("nuxt plugin after fetch config");
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
