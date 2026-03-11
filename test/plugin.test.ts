import { beforeEach, describe, expect, it, vi } from 'vitest'

const useFlyoConfigMock = vi.fn()

vi.mock('@flyo/nitro-vue3', () => ({
  default: { install: vi.fn() },
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

describe('flyo plugin', () => {
  beforeEach(() => {
    useFlyoConfigMock.mockResolvedValue({ response: { pages: [] } })
  })

  it('does not handle live edit initialization (delegated to @flyo/nitro-vue3 FlyoPage component)', async () => {
    setRuntimeConfig({ liveEdit: true })
    globalThis.window = globalThis.window || ({} as any)

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn() }
    await plugin({ vueApp } as any)

    // Plugin should only call vueApp.use for FlyoVue — no mixin, no useFlyoLiveEdit
    expect(vueApp.use).toHaveBeenCalledTimes(1)
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
