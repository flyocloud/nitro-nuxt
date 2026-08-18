import { useAsyncData, toValue } from '#imports'
import { getFlyoConfig } from '@flyo/nitro-vue3'
import { SearchApi } from '@flyo/nitro-typescript'
import type { MaybeRefOrGetter } from 'vue'
import type { EntityinterfaceInner, SearchSortEnum } from '@flyo/nitro-typescript'

export interface FlyoSearchOptions {
  /**
   * Sort order of the results, `score` (relevance, the default), `title`,
   * `time_start` or `updated_at`. Prefix with `-` to reverse it.
   */
  sort?: SearchSortEnum

  /**
   * Result page, starting at 1.
   */
  page?: number

  /**
   * Language context, only relevant in multi-lingual setups. Results are
   * filtered down to the given language.
   */
  lang?: string
}

/**
 * Full-text search through the sitemap, covering pages as well as entities.
 * Matches against titles and teasers, sorted by relevance unless
 * `options.sort` says otherwise.
 *
 * Results share the sitemap item shape, so a hit links through its `href` —
 * the finished link, internal paths with a trailing slash — and carries an
 * `updated_at` Unix timestamp. Items without an `href` have no reachable URL.
 *
 * The query may be a plain string or a reactive source; a reactive query is
 * watched and re-runs the search on change. An empty query resolves to an
 * empty list without hitting the API, so it is safe to bind straight to an
 * input.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const query = ref('')
 * const { response: hits } = await useFlyoSearch(query)
 * </script>
 *
 * <template>
 *   <input v-model="query">
 *   <a v-for="hit in hits" :key="hit.entity_unique_id" :href="hit.href">
 *     {{ hit.entity_title }}
 *   </a>
 * </template>
 * ```
 */
export const useFlyoSearch = async (query: MaybeRefOrGetter<string>, options: FlyoSearchOptions = {}):Promise<any> => {
  const { sort, page, lang } = options
  const currentQuery = () => (toValue(query) || '').trim()

  // The key is taken from the query the search starts with, so two widgets
  // searching different terms do not share an entry. A reactive query keeps
  // that key and refetches into it whenever the term changes.
  const key = `flyoSearch:${JSON.stringify([currentQuery(), sort, page, lang])}`

  const { data, error, refresh } = await useAsyncData<EntityinterfaceInner[]>(key, async () => {
    const search = currentQuery()

    if (!search) {
      return []
    }

    const configuration = getFlyoConfig()

    if (!configuration) {
      throw new Error('Flyo is not configured, make sure the `@flyo/nitro-nuxt` module is registered in `nuxt.config`')
    }

    return await new SearchApi(configuration).search({
      query: search,
      ...(sort !== undefined && { sort }),
      ...(page !== undefined && { page }),
      ...(lang !== undefined && { lang })
    })
  }, {
    watch: [currentQuery]
  })

  // The first run throws, like every other composable here. A later run — one
  // the watched query triggered — is past the point where throwing would reach
  // anybody, so `error` is handed out for those.
  if (error?.value) {
    throw error.value
  }

  return {
    response: data,
    error,
    refresh
  }
}
