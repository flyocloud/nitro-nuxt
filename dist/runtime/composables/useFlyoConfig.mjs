import { useFlyoConfig as useFlyoConfigVue } from "@flyodev/nitrocms-vue3";
export const useFlyoConfig = async () => {
  const config = useFlyoConfigVue();
  if (config?.error?.value) {
    throw config?.error?.value;
  }
  return {
    response: config.response
  };
};
