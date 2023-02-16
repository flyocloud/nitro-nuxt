import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { fileURLToPath } from 'url'
import { resolve } from 'path'
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

    const { resolve } = createResolver(import.meta.url)

    // Transpile runtime
    const runtimeDir = resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)

    // Add plugin to load user before bootstrap
    addPlugin(resolve(runtimeDir, 'flyo.plugin'))
  }
})

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      flyo?: ModuleOptions
    }
  }
}