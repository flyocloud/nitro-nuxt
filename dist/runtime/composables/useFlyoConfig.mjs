import { useAsyncData, ref } from "#imports";
import { useFlyoConfig as useFlyoConfigVue } from "@flyodev/nitrocms-vue3";
export const useFlyoConfig = async () => {
  const { fetch } = useFlyoConfigVue();
  const { data, error, refresh } = await useAsyncData("flyoConfig", fetch);
  if (data?.value?.error || error?.value) {
    throw data?.value?.error || error?.value;
  }
  return {
    response: ref(data.value.response),
    refresh
  };
};
