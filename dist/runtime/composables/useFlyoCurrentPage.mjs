import { useRoute } from "#imports";
import { useFlyoPage } from "@flyodev/nitrocms-vue3";
export const useFlyoCurrentPage = async () => {
  const route = useRoute();
  const page = useFlyoPage(route.path);
  await page.fetch();
  if (page.error.value) {
    throw page.error.value;
  }
  return {
    response: page.response,
    isEditable: page.isEditable,
    putContent: page.putContent
  };
};
