export default defineNuxtConfig({
    modules: [
      [
        "@flyodev/nitrocms-nuxt",
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