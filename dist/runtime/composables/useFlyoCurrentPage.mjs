import { useRoute } from "#imports";
import { useFlyoPage } from "./useFlyoPage.mjs";
export const useFlyoCurrentPage = async () => {
  const route = useRoute();
  const page = await useFlyoPage(route.path);
  return {
    response: page.response,
    isEditable: page.isEditable,
    putContent: page.putContent
  };
};
