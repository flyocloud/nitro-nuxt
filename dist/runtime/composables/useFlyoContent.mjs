import { useFlyoContent as useFlyoContentVue } from "@flyodev/nitrocms-vue3";
export const useFlyoContent = (pageId) => {
  return useFlyoContentVue(pageId);
};
