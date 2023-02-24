import { useRoute, inject } from '#imports'

/**
 * Resolves the current page route
 */
export const useFlyoCurrentPage = (): Object => {
  const { page } = inject('flyo')
  const { fetch } = page

  const route = useRoute()
  fetch(route.path)

  return {
    ...page
  }
}