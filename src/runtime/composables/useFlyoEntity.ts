import { onMounted } from '#imports'
import { useFlyoEntity as useFlyoEntityVue } from '@flyodev/nitrocms-vue3'

export const useFlyoEntity = async (uniqueId: string):Promise<any> => {
	onMounted(() => {
		// generate flyo metric request
		if (entity.response.value?.entity_metric?.api) {
			fetch(entity.response.value.entity_metric.api)
		}
	})

  const entity = useFlyoEntityVue(uniqueId)
  await entity.fetch()

  if (entity.error.value) {
    throw entity.error.value
  }
  return {
		response: entity.response
	}
}