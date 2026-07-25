import { defineNuxtModule, addPlugin, createResolver, extendViteConfig, addImportsDir, addComponentsDir } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * Flyo Nitro Auth Token
   * @default process.env.FLYO_TOKEN
   * @type string
   */
  apiToken: string

  apiBasePath: string

  liveEdit: boolean

  liveEditOrigin: string

  registerPageRoutes: boolean

  defaultPageRoute: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@flyo/nitro-nuxt',
    configKey: 'flyo',
  },

  defaults: {
    apiToken: process.env.FLYO_API_TOKEN || '',
    apiBasePath: process.env.FLYO_API_BASE_PATH || '',
    registerPageRoutes: true,
    defaultPageRoute: 'cms',
    liveEdit: process.env.FLYO_LIVE_EDIT || process.env.NODE_ENV !== 'production',
    liveEditOrigin: process.env.FLYO_LIVE_EDIT_ORIGIN || 'https://flyo.cloud',
  },

  setup (options, nuxt) {

    // Make sure url is set
    if (!options.apiToken) {
      throw new Error('Missing `FLYO_API_TOKEN` in `.env`')
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
      if (!config.optimizeDeps) {
        config.optimizeDeps = {}
      }
      if (!config.optimizeDeps.include) {
        config.optimizeDeps.include = []
      }

      // @flyo/nitro-js-bridge is a dependency of @flyo/nitro-vue3, not of the site, so it
      // is declared in the nested form. Since nitro-vue3 2.4.0 the bridge is no longer
      // bundled into that package and would otherwise be discovered lazily on the first
      // client import — which makes Vite re-optimize and hard-reload the page, dropping the
      // live-edit connection inside the Flyo preview iframe.
      config.optimizeDeps.include.push(
        '@flyo/nitro-vue3',
        '@flyo/nitro-vue3 > @flyo/nitro-js-bridge'
      )
    })

    // Enable dirs
    addComponentsDir({ path: "~/flyo", global: true, pathPrefix: false })

    const flyoConfig = defu(<ModuleOptions>nuxt.options.runtimeConfig.public.flyo, {
      apiToken: options.apiToken,
      apiBasePath: options.apiBasePath,
      registerPageRoutes: options.registerPageRoutes,
      defaultPageRoute: options.defaultPageRoute,
      liveEdit: options.liveEdit,
      liveEditOrigin: options.liveEditOrigin
    })

    // ensure the liveEdit value is boolean
    if (typeof flyoConfig.liveEdit !== 'boolean') {
      flyoConfig.liveEdit = flyoConfig.liveEdit === 'true'
    }

    nuxt.options.runtimeConfig.public.flyo = flyoConfig
  }
})

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      flyo?: ModuleOptions
    }
  }
}