import { useRouter, defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useFlyoConfig } from './composables/useFlyoConfig'
import FlyoVue, { useFlyoLiveEdit } from '@flyo/nitro-vue3'

export default defineNuxtPlugin(async ({ vueApp }) => {
  const { apiToken, apiBasePath, liveEdit, liveEditOrigin, registerPageRoutes } = useRuntimeConfig().public.flyo

  vueApp.use(FlyoVue, {
    apiToken,
    apiBasePath,
    liveEdit,
    liveEditOrigin
  })

  if (liveEdit && typeof window !== 'undefined') {
    let initialized = false

    // Run the hook-based composable from an actual component setup context.
    vueApp.mixin({
      setup: () => {
        if (initialized) {
          return
        }

        initialized = true
        useFlyoLiveEdit()
      }
    })
  }

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