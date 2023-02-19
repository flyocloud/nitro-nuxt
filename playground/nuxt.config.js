export default defineNuxtConfig({
    modules: [
      [
        "@flyodev/nitrocms-nuxt3",
        {
          token: "123"
        }
      ]
    ],
    app: {
      head: {
        script: [{ src: "https://cdn.tailwindcss.com" }]
      }
    }
  });