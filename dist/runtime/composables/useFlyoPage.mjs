import { ref } from "vue";
import { PagesApi } from "@flyodev/nitrocms-js";
export function useFlyoPage(slug) {
  const page = ref(null);
  const error = ref(null);
  new PagesApi().page({ slug }).then((response) => {
    page.value = response;
  }, (error2) => {
    error2.value = error2;
  });
  return {
    page,
    error
  };
}
