import { beforeEach, describe, expect, it, vi } from 'vitest'

const useFlyoLiveEditMock = vi.fn()
const useFlyoConfigMock = vi.fn()

vi.mock('@flyo/nitro-vue3', () => ({
  default: { install: vi.fn() },
  useFlyoLiveEdit: useFlyoLiveEditMock,
  editable: vi.fn((block: { uid?: string }) =>
    block?.uid ? { 'data-flyo-uid': block.uid } : {}
  )
}))

const useRuntimeConfigMock = vi.fn()
const useRouterMock = vi.fn(() => ({ addRoute: vi.fn() }))

vi.mock('#imports', () => ({
  defineNuxtPlugin: (fn: Function) => fn,
  useRuntimeConfig: useRuntimeConfigMock,
  useRouter: useRouterMock
}))

vi.mock('../src/runtime/composables/useFlyoConfig', () => ({
  useFlyoConfig: useFlyoConfigMock
}))

function setRuntimeConfig(overrides: Record<string, unknown> = {}) {
  useRuntimeConfigMock.mockReturnValue({
    public: {
      flyo: {
        apiToken: 'test-token',
        apiBasePath: '',
        liveEdit: true,
        liveEditOrigin: 'https://flyo.cloud',
        registerPageRoutes: false,
        ...overrides
      }
    }
  })
}

describe('flyo plugin – live edit', () => {
  beforeEach(() => {
    useFlyoLiveEditMock.mockClear()
    useFlyoConfigMock.mockResolvedValue({ response: { pages: [] } })
  })

  it('calls useFlyoLiveEdit when liveEdit is true on the client', async () => {
    setRuntimeConfig({ liveEdit: true })
    // window is defined in the default vitest (node) environment via jsdom-like globals;
    // make sure it exists for a "client" scenario
    globalThis.window = globalThis.window || ({} as any)

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn() }
    await plugin({ vueApp } as any)

    expect(useFlyoLiveEditMock).toHaveBeenCalledOnce()
  })

  it('does NOT call useFlyoLiveEdit when liveEdit is false', async () => {
    setRuntimeConfig({ liveEdit: false })

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn() }
    await plugin({ vueApp } as any)

    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()
  })

  it('does NOT call useFlyoLiveEdit on the server even if liveEdit is true', async () => {
    const originalWindow = globalThis.window
    // @ts-expect-error simulate server-side by removing window
    delete globalThis.window
    setRuntimeConfig({ liveEdit: true })

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn() }
    await plugin({ vueApp } as any)

    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()
    // restore
    globalThis.window = originalWindow
  })
})

describe('editable helper', () => {
  it('re-exports editable from @flyo/nitro-vue3', async () => {
    const { editable } = await import('../src/runtime/composables/editable')
    expect(editable).toBeDefined()
    expect(typeof editable).toBe('function')
  })

  it('returns data-flyo-uid when block has uid', async () => {
    const { editable } = await import('../src/runtime/composables/editable')
    const result = editable({ uid: 'abc-123' } as any)
    expect(result).toEqual({ 'data-flyo-uid': 'abc-123' })
  })

  it('returns empty object when block has no uid', async () => {
    const { editable } = await import('../src/runtime/composables/editable')
    const result = editable({} as any)
    expect(result).toEqual({})
  })
})
