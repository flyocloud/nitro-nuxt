import { useRoute, inject } from '#imports'

/**
 * Resolves the current page route
 * 
 * todo: type hinting
 */
export const useFlyoCurrentPage = async (): Promise<Object> => {
  const { page } = inject('flyo')
  const { fetch } = page

  const route = useRoute()
  await fetch(route.path)

  return {
    ...page
  }
}