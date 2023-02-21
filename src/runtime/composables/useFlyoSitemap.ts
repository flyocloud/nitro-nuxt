import { ref } from 'vue'
import { SitemapApi } from '@flyodev/nitrocms-js'

export const useFlyoSitemap = async (): Promise<any> => {

  const sitemap = ref(false)

  try {
    sitemap.value = await new SitemapApi().sitemap()
  } catch (e) {
    sitemap.value = false
  }
  
  return {
    sitemap: sitemap
  }
}