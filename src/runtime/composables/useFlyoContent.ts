import { ContentApi } from '@flyodev/nitrocms-js'
import { useRoute } from '#imports'

export const useFlyoContent = (pageId: number) => {

  const isEditable = (): boolean => {
    const route = useRoute()
    const token = route.query?.token || false
    if (token && (process.env.NODE_ENV === 'preview' || process.env.NODE_ENV === 'development')) {
      return true
    }

    return false
  }

  const putContent = async (blockUniqueid: string, contentIdentifier: string, newValue: any): Promise<any> => {
    try {
      const route = useRoute()
      const payload = {
        value: newValue,
        identifier: contentIdentifier,
        uid: blockUniqueid,
        token: route.query.token
      }
      console.log(payload)
      await new ContentApi().putContent(pageId, payload)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    putContent,
    isEditable
  }
}