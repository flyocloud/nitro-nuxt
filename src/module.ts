import { defineNuxtModule, addPlugin, createResolver, extendViteConfig, addImportsDir, addComponentsDir } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * Flyo Nitro CMS Auth Token
   * @default process.env.FLYO_TOKEN
   * @type string
   */
  token: string

  allowEdit: boolean

  liveEditOrigin: string

  registerPageRoutes: boolean

  defaultPageRoute: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@flyodev/nitrocms-nuxt',
    configKey: 'flyo',
  },

  defaults: {
    token: process.env.FLYO_TOKEN || '',
    registerPageRoutes: true,
    defaultPageRoute: 'cms',
    allowEdit: process.env.NODE_ENV !== 'production',
    liveEditOrigin: process.env.FLYO_LIVE_EDIT_ORIGIN || 'https://flyo.cloud'
  },

  setup (options, nuxt) {

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

    // Add composables
    addImportsDir(resolve(runtimeDir, 'composables'))

    extendViteConfig((config) => {
      config.optimizeDeps?.include?.push(
        ...['@flyodev/nitrocms-js']
      )
    })

    // Enable dirs
    addComponentsDir({ path: "~/flyo", global: true, pathPrefix: false })

    nuxt.options.runtimeConfig.public.flyo = defu(nuxt.options.runtimeConfig.flyo, {
      token: options.token,
      registerPageRoutes: options.registerPageRoutes,
      defaultPageRoute: options.defaultPageRoute,
      allowEdit: options.allowEdit,
      liveEditOrigin: options.liveEditOrigin
    })
  }
})

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      flyo?: ModuleOptions
    }
  }
}