import { defineNuxtModule, addPlugin, createResolver, extendViteConfig, addImportsDir, addComponentsDir, addComponent } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * Flyo Nitro CMS Auth Token
   * @default process.env.FLYO_TOKEN
   * @type string
   */
  token: string

  registerPageRoutes: boolean

  defaultPageRoute: string
}

export default defineNuxtModule<ModuleOptions>({

  meta: {
    name: '@flyodev/nitrocms-nuxt3',
    configKey: 'flyo',
  },
  defaults: {
    token: process.env.FLYO_TOKEN || '',
    registerPageRoutes: true,
    defaultPageRoute: 'cms'
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

    // Add composables
    addImportsDir(resolve(runtimeDir, 'composables'))

    extendViteConfig((config) => {
      config.optimizeDeps?.include?.push(
        ...['@flyodev/nitrocms-js']
      )
    })

    // Enable dirs
    addComponentsDir({ path: "~/flyo", global: true, pathPrefix: false });

    addComponent({
      name: 'FlyoPage', // name of the component to be used in vue templates,
      export: 'Page',
      filePath: '@flyodev/nitrocms-vue3' // resolve(runtimeDir, 'components', 'MyComponent.vue')
    })

    addComponent({
      name: 'FlyoBlock', // name of the component to be used in vue templates
      export: 'Block',
      filePath: '@flyodev/nitrocms-vue3' // resolve(runtimeDir, 'components', 'MyComponent.vue')
    })

    nuxt.options.runtimeConfig.public.flyo = defu(nuxt.options.runtimeConfig.flyo, {
      token: options.token,
      registerPageRoutes: options.registerPageRoutes,
      defaultPageRoute: options.defaultPageRoute
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