import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Flyo Nitro CMS Auth Token
   * @default process.env.FLYO_TOKEN
   * @type string
   */
  token: string
}

export default defineNuxtModule<ModuleOptions>({

  meta: {
    name: '@flyodev/nitrocms-nuxt3',
    configKey: 'flyo'
  },
  defaults: {
    token: process.env.FLYO_TOKEN
  },

  async setup (options, nuxt) {

    // Make sure url is set
    if (!options.token) {
      throw new Error('Missing `FLYO_TOKEN` in `.env`')
    }

    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
  }
})