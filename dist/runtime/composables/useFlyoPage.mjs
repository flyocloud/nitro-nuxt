import { ref } from "vue";
import { PagesApi } from "@flyodev/nitrocms-js";
import { useFlyoContent } from "./useFlyoContent.mjs";
export const useFlyoPage = async (slug) => {
  const page = ref(null);
  const error = ref(null);
  try {
    page.value = await new PagesApi().page({ slug });
  } catch (error2) {
    error2.value = error2;
  }
  const { putContent, isEditable } = useFlyoContent(page.value.id);
  return {
    page,
    error,
    putContent,
    isEditable
  };
};
