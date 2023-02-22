import { useFlyoPage } from '@flyodev/nitrocms-vue3'
import { useRoute } from '#imports'

/**
 * Resolves the current page route
 */
export const useFlyoCurrentPage = async(): Promise<any> => {
  const route = useRoute()
  return await useFlyoPage(route.path)
}