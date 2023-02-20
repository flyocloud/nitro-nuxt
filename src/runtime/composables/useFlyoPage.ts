import { ref } from 'vue'
import { PagesApi } from '@flyodev/nitrocms-js'


/**
 * Resolves the page for a given route
 * @see https://stackoverflow.com/a/69208479/4611030
 * @see https://nuxt.com/docs/guide/directory-structure/composables
 * @see https://vuejs.org/guide/reusability/composables.html
 */
export function useFlyoPage(slug: string) {

  const page = ref(null)
  const error = ref(null)

  new PagesApi().page({slug: slug}).then((response: {}) => {
    page.value = response
  }, (error: any) => {
    error.value = error
  })
  
  return {
    page: page,
    error: error
  }
}