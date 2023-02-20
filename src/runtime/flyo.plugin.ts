//import { ApiClient, ConfigApi, PagesApi, EntitiesApi, SitemapApi, ContentApi } from '@flyodev/nitrocms-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { ApiClient } from '@flyodev/nitrocms-js'
import { Block, Page } from '@flyodev/nitrocms-vue3'
import { useFlyoConfig } from './composables/useFlyoConfig'
import { useRouter } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {

  nuxtApp.vueApp.component('FlyoPage', Page)
  nuxtApp.vueApp.component('FlyoBlock', Block)

  const { token, defaultPageRoute, registerPageRoutes} = useRuntimeConfig().flyo

  const defaultClient = ApiClient.instance
  defaultClient.defaultHeaders = {}

  const ApiKeyAuth = defaultClient.authentications["ApiKeyAuth"]
  ApiKeyAuth.apiKey = token
  
  const { fetchConfig } = useFlyoConfig()

  const config = await fetchConfig()

  if (registerPageRoutes) {
    const router = useRouter()
    config.pages.forEach(route => {
      router.addRoute(
        {
          path: `/${route}`, 
          component: () => import(`~/pages/${defaultPageRoute}.vue`)
          
        }
      )
    })
  }
})