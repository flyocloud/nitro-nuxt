# @flyo/nitro-nuxt

Nuxt 3 module for integrating Flyo Nitro CMS into a Nuxt application.

## What This Module Adds

- Registers Flyo plugin (`@flyo/nitro-vue3`) in your Nuxt app.
- Auto-imports Flyo composables.
- Injects Flyo config into `runtimeConfig.public.flyo`.
- Optionally registers dynamic routes from Flyo config pages.

## Requirements

- Nuxt 3
- Node.js 18.12+ (Nuxt recommendation)
- A valid Flyo API token

## Install

```bash
npm install @flyo/nitro-nuxt
```

## Quick Start

Add the module in your `nuxt.config.ts` (or `nuxt.config.js`):

```ts
export default defineNuxtConfig({
	modules: [
		['@flyo/nitro-nuxt', {
			apiToken: process.env.FLYO_API_TOKEN
		}]
	]
})
```

Set your environment variable:

```bash
FLYO_API_TOKEN=your-token
```

Important:
- `apiToken` is required. The module throws on startup if missing.

## Required Page For Dynamic Routes

By default, `registerPageRoutes` is enabled and Flyo pages are registered dynamically.
The module currently imports this page component for those routes:

- `~/pages/cms.vue`

Create `pages/cms.vue` in your Nuxt app if you keep dynamic route registration enabled.

If you do not want this behavior, disable it:

```ts
export default defineNuxtConfig({
	modules: [
		['@flyo/nitro-nuxt', {
			apiToken: process.env.FLYO_API_TOKEN,
			registerPageRoutes: false
		}]
	]
})
```

## Module Options

All options are under module config key `flyo`.

- `apiToken: string` default `process.env.FLYO_API_TOKEN || ''`
- `apiBasePath: string` default `process.env.FLYO_API_BASE_PATH || ''`
- `liveEdit: boolean | string` default `process.env.FLYO_LIVE_EDIT || process.env.NODE_ENV !== 'production'`
- `liveEditOrigin: string` default `process.env.FLYO_LIVE_EDIT_ORIGIN || 'https://flyo.cloud'`
- `registerPageRoutes: boolean` default `true`
- `defaultPageRoute: string` default `'cms'`

## Environment Variables

- `FLYO_API_TOKEN`
- `FLYO_API_BASE_PATH`
- `FLYO_LIVE_EDIT`
- `FLYO_LIVE_EDIT_ORIGIN`

## Auto-Imported Composables

This module auto-imports these composables:

- `useFlyoConfig()`
- `useFlyoCurrentPage()`
- `useFlyoEntity(uniqueId)`
- `useFlyoPage(slug)`
- `useFlyoSitemap()`
- `editable(block)` — returns `data-flyo-uid` attribute for live-edit support

Example:

```vue
<script setup lang="ts">
const { response: page } = await useFlyoCurrentPage()
</script>

<template>
	<pre>{{ page }}</pre>
</template>
```

## Components Directory

The module registers a global components directory at:

- `~/flyo`

Place your Flyo block components there. Each component receives a `block` prop from the CMS.

### Live-Edit Support for Blocks

When `liveEdit` is enabled (the default in non-production environments), the module automatically activates live-editing features — page reload on content changes, scroll-to-block, and hover-highlight with click-to-edit. **No extra setup is needed in your layout or `App.vue`.**

To make individual block components discoverable by the live editor, use the auto-imported `editable` helper to bind the block's `data-flyo-uid` attribute:

```vue
<script setup>
defineProps({ block: Object })
</script>

<template>
  <section v-bind="editable(block)" class="bg-gray-200 p-8 rounded-lg text-center">
    <h2 class="text-3xl font-bold mb-4">{{ block?.content?.title }}</h2>
    <p class="text-lg mb-6">{{ block?.content?.teaser }}</p>
  </section>
</template>
```

`editable(block)` returns `{ 'data-flyo-uid': block.uid }` when the block has a uid, or an empty object otherwise. This is safe to include unconditionally — it has no effect when live-edit is disabled.

## Local Development (This Repository)

Use these commands:

```bash
npm install
npm run test
npm run build
```

### Playground

`playground/` is a local Nuxt app for manual module testing.
It depends on the local module via `file:..`.

```bash
npm run playground:dev
npm run playground:build
```

## CI And Releases

- CI runs tests and build checks.
- Publishing is handled by `semantic-release` in GitHub Actions.
- Version bump is commit-message driven:
- `feat: ...` -> minor
- `fix: ...` -> patch
- `feat!: ...` or `BREAKING CHANGE:` -> major

### Releasing `2.0.0` Next

If you want the next automated release to be `2.0.0`, make sure a `1.0.0` git tag exists in the repository history.

```bash
git tag 1.0.0
git push origin 1.0.0
```

Then merge a breaking-change commit, for example:

```text
feat!: migrate module behavior for Nuxt 3.21

BREAKING CHANGE: dynamic cms route registration and runtime entrypoints changed.
```

Dry-run locally:

```bash
npm run release:dry-run
```

## Docs

[Flyo Nuxt docs](https://dev.flyo.cloud/nitro/nuxt)