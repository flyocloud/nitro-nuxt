import { useSeoMeta } from '#imports'
import { useFlyoPage as useFlyoPageVue } from '@flyodev/nitrocms-vue3'

/**
 * Resolves the current page route
 */
export const useFlyoPage = async (slug: string):Promise<any> => {
  const page = useFlyoPageVue(slug)
  await page.fetch()

  if (page?.error?.value) {
    throw page.error.value
  }

  useSeoMeta({
    title: () => page.response.value.meta_json.title,
    ogTitle: () => page.response.value.meta_json.title,
    description: () => page.response.value.meta_json.description,
    ogDescription: () => page.response.value.meta_json.description,
    ogImage: () => page.response.value.meta_json.image,
    twitterCard: () => page.response.value.meta_json.image
  })

  return {
    response: page.response,
    isEditable: page.isEditable,
    putContent: page.putContent
  }
}