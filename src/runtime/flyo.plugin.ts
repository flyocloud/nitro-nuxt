import { useRouter, defineNuxtPlugin, useAsyncData, useRuntimeConfig } from '#imports'
import { useFlyoConfig } from './composables/useFlyoConfig'
import FlyoVue from '@flyodev/nitrocms-vue3'

export default defineNuxtPlugin(async ({ vueApp }) => {
  const { apiToken, apiBasePath, liveEdit, liveEditOrigin, registerPageRoutes } = useRuntimeConfig().flyo

  vueApp.use(FlyoVue, {
    apiToken,
    apiBasePath,
    liveEdit,
    liveEditOrigin
  })

  const { response: config } = await useFlyoConfig()

  const router = useRouter()
  if (registerPageRoutes) {
    config.pages.forEach((route: object) => {
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