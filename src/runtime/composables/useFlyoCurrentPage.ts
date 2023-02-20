import { useFlyoPage } from "./useFlyoPage"
import { useRoute } from '#imports'

/**
 * Resolves the current page route
 */
export function useFlyoCurrentPage() {

  const route = useRoute()
  return useFlyoPage(route.path)
}