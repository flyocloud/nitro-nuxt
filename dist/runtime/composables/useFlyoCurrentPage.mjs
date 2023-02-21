import { useFlyoPage } from "./useFlyoPage.mjs";
import { useRoute } from "#imports";
export const useFlyoCurrentPage = async () => {
  const route = useRoute();
  return await useFlyoPage(route.path);
};
