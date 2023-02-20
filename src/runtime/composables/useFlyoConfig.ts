import { reactive, toRefs } from 'vue'
import { ConfigApi } from '@flyodev/nitrocms-js'

const state = reactive({
  config: false,
  loading: true
})

/**
 * @see https://stackoverflow.com/a/69208479/4611030
 * @see https://nuxt.com/docs/guide/directory-structure/composables
 * @see https://vuejs.org/guide/reusability/composables.html
 */
export const useFlyoConfig = () => {

  const fetchConfig = async (): Promise<any> => {
    try {
      state.config = await new ConfigApi().config()
      state.loading = false
    } catch (e) {
      console.error(e)
    }

    return state.config
  }
  
  return {
    ...toRefs(state),
    fetchConfig
  }
}