import { useRoute, inject } from '#imports'

/**
 * Resolves the current page route
 * 
 * todo: type hinting
 */
export const useFlyoConfig = (): Object => {
  const { config } = inject('flyo')

  return {
    config
  }
}