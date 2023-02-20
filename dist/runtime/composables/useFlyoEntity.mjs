import { ref } from "vue";
import { EntitiesApi } from "@flyodev/nitrocms-js";
export const useFlyoEntity = async (uniqueid) => {
  const response = ref(null);
  try {
    response.value = await new EntitiesApi().entity(uniqueid);
  } catch (e) {
    response.value = false;
  }
  return {
    response
  };
};
