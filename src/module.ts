import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  token: string
}

export default defineNuxtModule<ModuleOptions>({

  meta: {
    name: 'flyo',
    configKey: 'flyo'
  },
  defaults: {
    token: ''
  },

  async setup (moduleOptions, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
  }
})