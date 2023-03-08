# Flyo Nitro CMS Nuxt

A Nuxt 3 Plugin for Nitro CMS

```node
yarn add @flyodev/nitrocms-nuxt
```

nuxt.config.js

```js
modules: ['@flyodev/nitrocms-nuxt'],
```

add `.env` file with `FLYO_API_TOKEN=XYZ` or add property `apiToken` to module config `modules: ['@flyodev/nitrocms-nuxt', {apiToken: 'XYZ'}]`,

## Environment Variables

All available env variables

+ FLYO_API_TOKEN
+ FLYO_API_BASE_PATH
+ FLYO_LIVE_EDIT_ORIGIN
+ FLYO_LIVE_EDIT (whether its enabled or not, by default its enabled if not node_env production)

## More

[Read more on dev.flyo.cloud/nitrocms/nuxt](https://dev.flyo.cloud/nitrocms/nuxt)