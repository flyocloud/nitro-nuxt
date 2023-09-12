import { useAsyncData, ref } from "#imports";
import { useFlyoPage as useFlyoPageVue } from "@flyo/nitro-vue3";
export const useFlyoPage = async (slug) => {
  const { fetch } = useFlyoPageVue(slug);
  const { data, error, refresh } = await useAsyncData(slug, fetch);
  if (data?.value?.error || error?.value) {
    throw data?.value?.error || error?.value;
  }
  await {
    title: () => data.value.response.meta_json.title,
    ogTitle: () => data.value.response.meta_json.title,
    description: () => data.value.response.meta_json.description,
    ogDescription: () => data.value.response.meta_json.description,
    ogImage: () => data.value.response.meta_json.image,
    twitterCard: () => data.value.response.meta_json.image
  };
  return {
    response: ref(data.value.response),
    refresh
  };
};
