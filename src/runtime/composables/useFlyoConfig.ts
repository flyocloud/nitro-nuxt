import { useFlyoConfig as useFlyoConfigVue } from '@flyodev/nitrocms-vue3'

/**
 * Resolves the current page route
 */
export const useFlyoConfig = async ():Promise<any> => {
  const config = useFlyoConfigVue()

  if (config?.error?.value) {
    throw config?.error?.value
  }

  return {
    response: config.response
  }
}