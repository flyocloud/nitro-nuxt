import { useAsyncData, useSeoMeta, ref } from '#imports'
import { useFlyoPage as useFlyoPageVue } from '@flyodev/nitrocms-vue3'

/**
 * Resolves the current page route
 */
export const useFlyoPage = async (slug: string):Promise<any> => {
  const { fetch } = useFlyoPageVue(slug)
  const { data, error, refresh } = await useAsyncData(slug, fetch)

  if (data?.value?.error || error?.value) {
    throw data?.value?.error || error?.value
  }

  useSeoMeta({
    title: () => data.value.response.meta_json.title,
    ogTitle: () => data.value.response.meta_json.title,
    description: () => data.value.response.meta_json.description,
    ogDescription: () => data.value.response.meta_json.description,
    ogImage: () => data.value.response.meta_json.image,
    twitterCard: () => data.value.response.meta_json.image
  })

  return {
    response: ref(data.value.response),
		refresh
  }
}