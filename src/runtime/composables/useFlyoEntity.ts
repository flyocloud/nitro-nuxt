import { ref } from 'vue'
import { EntitiesApi } from '@flyodev/nitrocms-js'

export const useFlyoEntity = async (uniqueid: string): Promise<any> => {

  const response = ref(null)

  try {
    response.value = await new EntitiesApi().entity(uniqueid)
  } catch (e) {
    response.value = false
  }
  
  return {
    response: response
  }
}