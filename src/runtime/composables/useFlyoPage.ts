import { ref } from 'vue'
import { PagesApi } from '@flyodev/nitrocms-js'
import { useFlyoContent } from './useFlyoContent'


/**
 * Resolves the page for a given route
 * @see https://stackoverflow.com/a/69208479/4611030
 * @see https://nuxt.com/docs/guide/directory-structure/composables
 * @see https://vuejs.org/guide/reusability/composables.html
 */
export const useFlyoPage = async(slug: string): Promise<any> => {

  const page = ref(null)
  const error = ref(null)

  try {
    page.value = await new PagesApi().page({slug: slug})
  } catch (error) {
    error.value = error
  }
  
  const { putContent, isEditable } = useFlyoContent(page.value.id)
  
  return {
    page: page,
    error: error,
    putContent,
    isEditable
  }
}