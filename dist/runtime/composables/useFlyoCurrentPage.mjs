import { useRoute, inject } from "#imports";
export const useFlyoCurrentPage = () => {
  const { page } = inject("flyo");
  const { fetch } = page;
  const route = useRoute();
  fetch(route.path);
  return {
    ...page
  };
};
