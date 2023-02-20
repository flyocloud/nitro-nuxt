import { useFlyoPage } from "./useFlyoPage.mjs";
import { useRoute } from "#imports";
export function useFlyoCurrentPage() {
  const route = useRoute();
  return useFlyoPage(route.path);
}
