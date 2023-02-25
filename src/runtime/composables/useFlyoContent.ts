import { useFlyoContent as useFlyoContentVue } from '@flyodev/nitrocms-vue3'

/**
 * Resolves the current page route
 */
export const useFlyoContent = (pageId: number):Object => {
  return useFlyoContentVue(pageId)
}