import { useFlyoPage } from "@flyodev/nitrocms-vue3";
import { useRoute } from "#imports";
export const useFlyoCurrentPage = async () => {
  const route = useRoute();
  return await useFlyoPage(route.path);
};
