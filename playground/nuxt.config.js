export default defineNuxtConfig({
    modules: [
      [
        "@flyo/nitro-nuxt",
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