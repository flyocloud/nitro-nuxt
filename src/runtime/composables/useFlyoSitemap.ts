import { useFlyoSitemap as useFlyoSitemapVue } from '@flyo/nitro-vue3'

/**
 * Loads the full sitemap: every page from the containers plus every mapped
 * entity, including all language variants of a multi-lingual setup.
 *
 * Each item carries the two attributes a sitemap is built from:
 *
 * - `href` — the finished link. Internal paths come with a trailing slash
 *   (`/about-me/`), mail links as `mailto:hello@flyo.ch`. Items without an
 *   `href` have no reachable URL and must be skipped.
 * - `updated_at` — a Unix timestamp of the last content change, meant for
 *   `lastmod`. A rebuild that produces identical output does not move it.
 *
 * `routes` is the raw map of route identifiers behind that `href` (plus the
 * system key `_empty`); reach for it only when you need a specific named route.
 *
 * @example
 * ```ts
 * const { response } = await useFlyoSitemap()
 *
 * const urls = response.value
 *   .filter(item => item.href)
 *   .map(item => ({
 *     loc: item.href,
 *     lastmod: new Date(item.updated_at * 1000).toISOString()
 *   }))
 * ```
 */
export const useFlyoSitemap = async ():Promise<any> => {
  const sitemap = useFlyoSitemapVue()
  await sitemap.fetch()

  if (sitemap.error.value) {
    throw sitemap.error.value
  }

  return {
		response: sitemap.response
	}
}
