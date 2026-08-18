import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref, toValue, watch } from 'vue'

const searchMock = vi.fn()
const searchApiConstructor = vi.fn()
const getFlyoConfigMock = vi.fn()
const useFlyoSitemapVueMock = vi.fn()

const refreshMock = vi.fn()

// Stands in for useAsyncData: runs the handler, funnels a rejection into `error`
// instead of throwing, and re-runs on every configured watch source.
const useAsyncDataMock = vi.fn(async (
  _key: string,
  handler: () => Promise<unknown>,
  options: { watch?: unknown[] } = {}
) => {
  const data = ref<unknown>(null)
  const error = ref<unknown>(null)

  const run = async () => {
    try {
      data.value = await handler()
      error.value = null
    } catch (thrown) {
      data.value = null
      error.value = thrown
    }
  }

  await run()

  for (const source of options.watch ?? []) {
    watch(source as () => unknown, () => { void run() })
  }

  return { data, error, refresh: refreshMock }
})

vi.mock('#imports', () => ({
  useAsyncData: (key: string, handler: () => Promise<unknown>, options?: { watch?: unknown[] }) =>
    useAsyncDataMock(key, handler, options),
  toValue
}))

vi.mock('@flyo/nitro-vue3', () => ({
  getFlyoConfig: () => getFlyoConfigMock(),
  useFlyoSitemap: () => useFlyoSitemapVueMock()
}))

vi.mock('@flyo/nitro-typescript', () => ({
  SearchApi: class {
    constructor(configuration: unknown) {
      searchApiConstructor(configuration)
    }

    search (requestParameters: unknown) {
      return searchMock(requestParameters)
    }
  }
}))

import { useFlyoSearch } from '../src/runtime/composables/useFlyoSearch'
import { useFlyoSitemap } from '../src/runtime/composables/useFlyoSitemap'

describe('useFlyoSearch', () => {
  beforeEach(() => {
    searchMock.mockReset()
    searchApiConstructor.mockReset()
    getFlyoConfigMock.mockReset()
    useAsyncDataMock.mockClear()
    getFlyoConfigMock.mockReturnValue({ apiKey: 'token-123' })
  })

  it('returns the hits with their href and updated_at', async () => {
    const hits = [
      { entity_unique_id: 'a', entity_title: 'About', href: '/about-me/', updated_at: 1_700_000_000 }
    ]
    searchMock.mockResolvedValue(hits)

    const { response, refresh } = await useFlyoSearch('about')

    expect(searchApiConstructor).toHaveBeenCalledWith({ apiKey: 'token-123' })
    expect(searchMock).toHaveBeenCalledWith({ query: 'about' })
    expect(response.value).toEqual(hits)
    expect(refresh).toBe(refreshMock)
  })

  it('forwards only the options that were passed', async () => {
    searchMock.mockResolvedValue([])

    await useFlyoSearch('about', { sort: '-updated_at', page: 2 })

    expect(searchMock).toHaveBeenCalledWith({ query: 'about', sort: '-updated_at', page: 2 })
  })

  it('keys the request by query and options so results are not shared', async () => {
    searchMock.mockResolvedValue([])

    await useFlyoSearch('about', { page: 1 })
    await useFlyoSearch('about', { page: 2 })

    const [firstKey] = useAsyncDataMock.mock.calls[0]
    const [secondKey] = useAsyncDataMock.mock.calls[1]
    expect(firstKey).not.toBe(secondKey)
  })

  it('re-runs the search when a reactive query changes', async () => {
    searchMock.mockResolvedValue([])
    const query = ref('about')

    await useFlyoSearch(query)
    expect(searchMock).toHaveBeenCalledWith({ query: 'about' })

    query.value = 'contact'
    await nextTick()
    await Promise.resolve()

    expect(searchMock).toHaveBeenCalledWith({ query: 'contact' })
    expect(searchMock).toHaveBeenCalledTimes(2)
  })

  it('trims the query before searching', async () => {
    searchMock.mockResolvedValue([])

    await useFlyoSearch('  about  ')

    expect(searchMock).toHaveBeenCalledWith({ query: 'about' })
  })

  it('resolves empty for a blank query without calling the api', async () => {
    const { response } = await useFlyoSearch('   ')

    expect(searchMock).not.toHaveBeenCalled()
    expect(searchApiConstructor).not.toHaveBeenCalled()
    expect(response.value).toEqual([])
  })

  it('throws when the flyo plugin did not configure the sdk', async () => {
    getFlyoConfigMock.mockReturnValue(null)

    await expect(useFlyoSearch('about')).rejects.toThrowError(/not configured/)
  })

  it('throws the api error', async () => {
    searchMock.mockRejectedValue(new Error('boom'))

    await expect(useFlyoSearch('about')).rejects.toThrowError('boom')
  })

  it('exposes an error a later run ran into instead of throwing it', async () => {
    searchMock.mockResolvedValue([])
    const query = ref('about')

    const { error } = await useFlyoSearch(query)
    expect(error.value).toBeNull()

    searchMock.mockRejectedValue(new Error('boom'))
    query.value = 'contact'
    await nextTick()
    await Promise.resolve()

    expect(error.value).toEqual(new Error('boom'))
  })
})

describe('useFlyoSitemap', () => {
  beforeEach(() => {
    useFlyoSitemapVueMock.mockReset()
  })

  it('fetches the sitemap without requiring an argument', async () => {
    const fetch = vi.fn().mockResolvedValue(undefined)
    const items = [
      { href: '/about-me/', updated_at: 1_700_000_000, routes: { _empty: null } }
    ]
    useFlyoSitemapVueMock.mockReturnValue({
      fetch,
      error: ref(null),
      response: ref(items)
    })

    const { response } = await useFlyoSitemap()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(response.value).toEqual(items)
  })

  it('throws the fetch error', async () => {
    useFlyoSitemapVueMock.mockReturnValue({
      fetch: vi.fn().mockResolvedValue(undefined),
      error: ref(new Error('sitemap down')),
      response: ref(null)
    })

    await expect(useFlyoSitemap()).rejects.toThrowError('sitemap down')
  })
})
