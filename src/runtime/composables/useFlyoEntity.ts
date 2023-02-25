import { useRoute, inject } from '#imports'

/**
 * Resolves the current page route
 * 
 * todo: type hinting
 */
export const useFlyoEntity = async (uniqueid:string): Promise<Object> => {
  const { entity } = inject('flyo')
  const { fetch } = entity

  await fetch(uniqueid)

  return {
    ...entity
  }
}