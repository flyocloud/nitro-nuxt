import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ModuleOptions } from '../src/module'

const nuxtKitMocks = vi.hoisted(() => {
  const optimizeDepsInclude: string[] = []

  return {
    optimizeDepsInclude,
    defineNuxtModule: vi.fn((definition: unknown) => definition),
    createResolver: vi.fn(() => ({
      resolve: (...segments: string[]) => segments.join('/')
    })),
    addPlugin: vi.fn(),
    addImportsDir: vi.fn(),
    addComponentsDir: vi.fn(),
    extendViteConfig: vi.fn((handler: (config: { optimizeDeps: { include: string[] } }) => void) => {
      handler({ optimizeDeps: { include: optimizeDepsInclude } })
    })
  }
})

vi.mock('@nuxt/kit', () => nuxtKitMocks)

import moduleDefinition from '../src/module'

type ModuleDefinitionInternals = {
  setup: (options: ModuleOptions, nuxt: unknown) => void
  meta: {
    name: string
    configKey: string
  }
  defaults: Record<string, unknown>
}

const moduleDefinitionInternal = moduleDefinition as unknown as ModuleDefinitionInternals

const baseOptions: ModuleOptions = {
  apiToken: 'token-123',
  apiBasePath: 'https://api.flyo.test',
  registerPageRoutes: true,
  defaultPageRoute: 'cms',
  liveEdit: true,
  liveEditOrigin: 'https://flyo.cloud'
}

function createNuxt(flyoConfig: Record<string, unknown> = {}) {
  return {
    options: {
      build: {
        transpile: [] as string[]
      },
      runtimeConfig: {
        public: {
          flyo: {
            ...flyoConfig
          }
        }
      }
    }
  }
}

describe('flyo nuxt module setup', () => {
  beforeEach(() => {
    nuxtKitMocks.optimizeDepsInclude.length = 0
    nuxtKitMocks.defineNuxtModule.mockClear()
    nuxtKitMocks.createResolver.mockClear()
    nuxtKitMocks.addPlugin.mockClear()
    nuxtKitMocks.addImportsDir.mockClear()
    nuxtKitMocks.addComponentsDir.mockClear()
    nuxtKitMocks.extendViteConfig.mockClear()
  })

  it('throws when api token is missing', () => {
    const nuxt = createNuxt()

    expect(() => {
      moduleDefinitionInternal.setup({ ...baseOptions, apiToken: '' }, nuxt as never)
    }).toThrowError('Missing `FLYO_API_TOKEN` in `.env`')
  })

  it('registers plugin, composables, components and runtime config', () => {
    const nuxt = createNuxt()

    moduleDefinitionInternal.setup(baseOptions, nuxt as never)

    expect(nuxt.options.build.transpile).toContain('./runtime')
    expect(nuxtKitMocks.addPlugin).toHaveBeenCalledWith('./runtime/flyo.plugin')
    expect(nuxtKitMocks.addImportsDir).toHaveBeenCalledWith('./runtime/composables')
    expect(nuxtKitMocks.addComponentsDir).toHaveBeenCalledWith({
      path: '~/flyo',
      global: true,
      pathPrefix: false
    })
    expect(nuxtKitMocks.optimizeDepsInclude).toContain('@flyo/nitro-js')
    expect(nuxt.options.runtimeConfig.public.flyo).toMatchObject({
      apiToken: 'token-123',
      apiBasePath: 'https://api.flyo.test',
      registerPageRoutes: true,
      defaultPageRoute: 'cms',
      liveEdit: true,
      liveEditOrigin: 'https://flyo.cloud'
    })
  })

  it('coerces runtimeConfig public flyo liveEdit values to booleans', () => {
    const nuxtTrue = createNuxt({ liveEdit: 'true' })
    moduleDefinitionInternal.setup(baseOptions, nuxtTrue as never)
    expect(nuxtTrue.options.runtimeConfig.public.flyo.liveEdit).toBe(true)

    const nuxtFalse = createNuxt({ liveEdit: 'false' })
    moduleDefinitionInternal.setup(baseOptions, nuxtFalse as never)
    expect(nuxtFalse.options.runtimeConfig.public.flyo.liveEdit).toBe(false)
  })

  it('adds @flyo/nitro-js to vite optimize dependencies', () => {
    const nuxt = createNuxt()
    moduleDefinitionInternal.setup(baseOptions, nuxt as never)

    expect(nuxtKitMocks.optimizeDepsInclude).toContain('@flyo/nitro-js')
  })

  it('adds ./runtime to transpile when liveEdit is enabled', () => {
    const nuxt = createNuxt()
    moduleDefinitionInternal.setup({ ...baseOptions, liveEdit: true }, nuxt as never)

    expect(nuxt.options.build.transpile).toContain('./runtime')
  })

  it('applies runtime config with options passed to setup', () => {
    const customOptions = {
      apiToken: 'custom-token-789',
      apiBasePath: 'https://custom-api.test',
      registerPageRoutes: false,
      defaultPageRoute: 'custom-page',
      liveEdit: false,
      liveEditOrigin: 'https://custom-origin.test'
    }
    const nuxt = createNuxt()

    moduleDefinitionInternal.setup(customOptions, nuxt as never)

    expect(nuxt.options.runtimeConfig.public.flyo.apiToken).toBe('custom-token-789')
    expect(nuxt.options.runtimeConfig.public.flyo.apiBasePath).toBe('https://custom-api.test')
    expect(nuxt.options.runtimeConfig.public.flyo.registerPageRoutes).toBe(false)
    expect(nuxt.options.runtimeConfig.public.flyo.defaultPageRoute).toBe('custom-page')
  })

  it('plugin registration is called exactly once', () => {
    const nuxt = createNuxt()
    moduleDefinitionInternal.setup(baseOptions, nuxt as never)

    expect(nuxtKitMocks.addPlugin).toHaveBeenCalledTimes(1)
    expect(nuxtKitMocks.addPlugin).toHaveBeenCalledWith('./runtime/flyo.plugin')
  })

  it('composables directory import is called exactly once', () => {
    const nuxt = createNuxt()
    moduleDefinitionInternal.setup(baseOptions, nuxt as never)

    expect(nuxtKitMocks.addImportsDir).toHaveBeenCalledTimes(1)
    expect(nuxtKitMocks.addImportsDir).toHaveBeenCalledWith('./runtime/composables')
  })

  it('components directory is registered globally', () => {
    const nuxt = createNuxt()
    moduleDefinitionInternal.setup(baseOptions, nuxt as never)

    expect(nuxtKitMocks.addComponentsDir).toHaveBeenCalledTimes(1)
    expect(nuxtKitMocks.addComponentsDir).toHaveBeenCalledWith({
      path: '~/flyo',
      global: true,
      pathPrefix: false
    })
  })

  it('stores module definition with correct configuration', () => {
    expect(moduleDefinition).toBeDefined()
    expect(moduleDefinitionInternal.meta).toBeDefined()
    expect(moduleDefinitionInternal.meta.name).toBe('@flyo/nitro-nuxt')
    expect(moduleDefinitionInternal.meta.configKey).toBe('flyo')
  })

  it('stores module definition with defaults object', () => {
    expect(moduleDefinitionInternal.defaults).toBeDefined()
    expect(moduleDefinitionInternal.defaults).toHaveProperty('apiToken')
    expect(moduleDefinitionInternal.defaults).toHaveProperty('apiBasePath')
    expect(moduleDefinitionInternal.defaults).toHaveProperty('registerPageRoutes')
    expect(moduleDefinitionInternal.defaults).toHaveProperty('defaultPageRoute')
    expect(moduleDefinitionInternal.defaults).toHaveProperty('liveEdit')
    expect(moduleDefinitionInternal.defaults).toHaveProperty('liveEditOrigin')
  })
})
