import { useFlyoEntity as useFlyoEntityVue } from '@flyodev/nitrocms-vue3'

export const useFlyoEntity = async (uniqueId: string):Promise<any> => {
  const entity = useFlyoEntityVue(uniqueId)
  await entity.fetch()

  if (entity.error.value) {
    throw entity.error.value
  }

  return {
		response: entity.response
	}
}