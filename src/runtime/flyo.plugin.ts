//import { ApiClient, ConfigApi, PagesApi, EntitiesApi, SitemapApi, ContentApi } from '@flyodev/nitrocms-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import FlyoVue, { useFlyoConfigStore } from '@flyodev/nitrocms-vue3'
import { useRouter } from '#imports'

export default defineNuxtPlugin(async ({ vueApp }) => {
  const { token, allowEdit, registerPageRoutes } = useRuntimeConfig().flyo

  vueApp.use(FlyoVue, {
    token,
    allowEdit
  });

  const flyoConfigStore = useFlyoConfigStore()
  await flyoConfigStore.fetch()

  const router = useRouter()
  if (registerPageRoutes) {
    flyoConfigStore.response.value.pages.forEach((route: object) => {
      router.addRoute(
        {
          name: `${route}`,
          path: `/${route}`, 
          component: () => import(`~/pages/cms.vue`) // using ${defaultPageRoute} does not work
        }
      )
    })
  }
})