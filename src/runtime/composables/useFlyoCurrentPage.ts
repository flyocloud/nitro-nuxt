import { useRoute } from '#imports'
import { useFlyoPage } from './useFlyoPage'

/**
 * Resolves the current page route
 */
export const useFlyoCurrentPage = async ():Promise<any> => {
  const route = useRoute()

  const page = await useFlyoPage(route.path)

  return {
    response: page.response,
  }
}