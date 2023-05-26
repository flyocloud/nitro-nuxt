import { useFlyoSitemap as useFlyoSitemapVue } from "@flyo/nitro-vue3";
export const useFlyoSitemap = async (uniqueId) => {
  const sitemap = useFlyoSitemapVue();
  await sitemap.fetch();
  if (sitemap.error.value) {
    throw sitemap.error.value;
  }
  return {
    response: sitemap.response
  };
};
