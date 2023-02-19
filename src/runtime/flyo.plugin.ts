//import { ApiClient, ConfigApi, PagesApi, EntitiesApi, SitemapApi, ContentApi } from '@flyodev/nitrocms-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { ApiClient } from '@flyodev/nitrocms-js'
import Block from '@flyodev/nitrocms-vue3'
import Page from '@flyodev/nitrocms-vue3'

export default defineNuxtPlugin(nuxtApp => {
    
    nuxtApp.vueApp.component('FlyoPage', Page)
    nuxtApp.vueApp.component('FlyoBlock', Block)

    const { token } = useRuntimeConfig().flyo


    /*nuxtApp.hook('app:created', () => {
        console.log(ApiClient) // <-------------- import Does not work
    })
    */
    

    
    const defaultClient = ApiClient.instance // <-------------- import Does not work
    defaultClient.defaultHeaders = {}

    const ApiKeyAuth = defaultClient.authentications["ApiKeyAuth"]
    ApiKeyAuth.apiKey = token

    /*
    const apis = {
        configApi: new ConfigApi(),
        pagesApi: new PagesApi(),
        entitiesApi: new EntitiesApi(),
        sitemapApi: new SitemapApi(),
        contentApi: new ContentApi(),
    }
    */
    let config = null

    return {
        provide: {
            flyo: {
                config: async () => {
                    try {
                        if (!config) {
                            config = await new ConfigApi().configApi.config()
                        }

                        return config
                    } catch (e) {
                        console.error(e)
                        return null
                    }
                },
            },
        },
    }
})