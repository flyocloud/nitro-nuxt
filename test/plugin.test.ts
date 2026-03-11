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
    useFlyoLiveEditMock.mockReset()
    useFlyoConfigMock.mockResolvedValue({ response: { pages: [] } })
  })

  it('registers a one-time setup mixin when liveEdit is true on the client', async () => {
    setRuntimeConfig({ liveEdit: true })
    globalThis.window = globalThis.window || ({} as any)

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn(), mixin: vi.fn() }
    await plugin({ vueApp } as any)

    expect(vueApp.mixin).toHaveBeenCalledTimes(1)
    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()
  })

  it('initializes live edit exactly once from component setup context', async () => {
    setRuntimeConfig({ liveEdit: true })
    globalThis.window = globalThis.window || ({} as any)

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn(), mixin: vi.fn() }
    await plugin({ vueApp } as any)

    const mixin = vueApp.mixin.mock.calls[0]?.[0]
    expect(typeof mixin?.setup).toBe('function')

    mixin.setup()
    mixin.setup()

    expect(useFlyoLiveEditMock).toHaveBeenCalledOnce()
  })

  it('does NOT register live edit mixin when liveEdit is false', async () => {
    setRuntimeConfig({ liveEdit: false })

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn(), mixin: vi.fn() }
    await plugin({ vueApp } as any)

    expect(vueApp.mixin).not.toHaveBeenCalled()
    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()
  })

  it('does NOT register live edit mixin on the server even if liveEdit is true', async () => {
    const originalWindow = globalThis.window
    // @ts-expect-error simulate server-side by removing window
    delete globalThis.window
    setRuntimeConfig({ liveEdit: true })

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn(), mixin: vi.fn() }
    await plugin({ vueApp } as any)

    expect(vueApp.mixin).not.toHaveBeenCalled()
    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()
    // restore
    globalThis.window = originalWindow
  })

  it('does not emit Vue lifecycle warnings during plugin execution when liveEdit is enabled', async () => {
    setRuntimeConfig({ liveEdit: true })
    globalThis.window = globalThis.window || ({} as any)

    useFlyoLiveEditMock.mockImplementation(() => {
      // This mimics what Vue warns about when a hook composable is called outside setup.
      console.warn('[Vue warn]: onMounted is called when there is no active component instance')
      console.warn('[Vue warn]: onUnmounted is called when there is no active component instance')
    })

    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { default: plugin } = await import('../src/runtime/flyo.plugin')
    const vueApp = { use: vi.fn(), mixin: vi.fn() }
    await plugin({ vueApp } as any)

    expect(useFlyoLiveEditMock).not.toHaveBeenCalled()

    const warningText = warningSpy.mock.calls.map((args) => String(args[0] ?? '')).join('\n')
    expect(warningText).not.toContain('onMounted is called when there is no active component instance')
    expect(warningText).not.toContain('onUnmounted is called when there is no active component instance')

    warningSpy.mockRestore()
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
