import { onMounted, useAsyncData, useFetch } from '#imports'
import { useFlyoEntity as useFlyoEntityVue } from '@flyodev/nitrocms-vue3'

export const useFlyoEntity = async (uniqueId: string):Promise<any> => {
	onMounted(() => {
    // generate flyo metric request
		if (data.value.response?.entity?.entity_metric?.api) {
      useFetch(data.value.response?.entity?.entity_metric?.api)
		}
	})

	const { fetch } = useFlyoEntityVue(uniqueId)
  const { data, error, refresh } = await useAsyncData(uniqueId, fetch)

	if (data?.value?.error || error?.value) {
    throw data?.value?.error || error?.value
  }

  return {
    response: data.value.response,
		refresh
  }
}