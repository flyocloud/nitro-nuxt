import { useAsyncData } from '#imports'
import { useFlyoConfig as useFlyoConfigVue } from '@flyo/nitro-vue3'

/**
 * Resolves the current page route
 */
export const useFlyoConfig = async ():Promise<any> => {
  const { fetch } = useFlyoConfigVue()
  const { data, error, refresh } = await useAsyncData('flyoConfig', fetch)

	if (data?.value?.error || error?.value) {
    throw data?.value?.error || error?.value
  }

  return {
    response: data.value.response,
		refresh
  }
}