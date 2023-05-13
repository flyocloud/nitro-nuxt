
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['flyo']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['flyo']?: ModuleOptions }
}

declare module 'nuxt/schema' {
  interface NuxtConfig { ['flyo']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['flyo']?: ModuleOptions }
}


export { ModuleOptions, default } from './module'
