export default defineNuxtConfig({
  modules: [
    [
      '@flyo/nitro-nuxt',
      {
        apiToken: '123'
      }
    ]
  ],
  app: {
    head: {
      script: [{ src: 'https://cdn.tailwindcss.com' }]
    }
  }
})