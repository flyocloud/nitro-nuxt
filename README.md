# @flyo/nitro-nuxt

Nuxt 4 module for integrating Flyo Nitro CMS into a Nuxt application.

## What This Module Adds

- Registers Flyo plugin (`@flyo/nitro-vue3`) in your Nuxt app.
- Auto-imports Flyo composables.
- Injects Flyo config into `runtimeConfig.public.flyo`.
- Optionally registers dynamic routes from Flyo config pages.

## Requirements

- Nuxt 4.3.1+
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
- `useFlyoSearch(query, options)`
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

## Sitemap

`useFlyoSitemap()` returns every page from the containers plus every mapped
entity, including all language variants of a multi-lingual setup. Each item
carries the two attributes a sitemap entry is built from:

- `href` — the finished link. Internal paths come with a trailing slash
	(`/about-me/`), mail links as `mailto:hello@flyo.ch`. Items without an `href`
	have no reachable URL and must be skipped.
- `updated_at` — a Unix timestamp of the last content change, meant for
	`lastmod`. A rebuild that produces identical output does not move it.

`routes` is the raw map of route identifiers behind that `href` (plus the system
key `_empty`); reach for it only when you need a specific named route.

```vue
<script setup lang="ts">
const { response } = await useFlyoSitemap()

const urls = computed(() => (response.value ?? [])
	.filter(item => item.href)
	.map(item => ({
		loc: new URL(item.href, 'https://example.com').href,
		lastmod: new Date(item.updated_at * 1000).toISOString()
	}))
)
</script>
```

The composable runs inside the Nuxt app, where the Flyo plugin has configured
the SDK — it is not available in a Nitro `server/` route. To serve a
`sitemap.xml`, render it from a page (or feed the entries above into a sitemap
module such as `@nuxtjs/sitemap`).

## Search

`useFlyoSearch(query, options)` runs a full-text search across pages and
entities, matching against titles and teasers. Results share the sitemap item
shape, so a hit links through its `href` and carries an `updated_at` timestamp.

```vue
<script setup lang="ts">
const query = ref('')
const { response: hits } = await useFlyoSearch(query)
</script>

<template>
	<input v-model="query">
	<ul>
		<li v-for="hit in hits" :key="hit.entity_unique_id">
			<a :href="hit.href">{{ hit.entity_title }}</a>
			<p>{{ hit.entity_teaser }}</p>
		</li>
	</ul>
</template>
```

The query may be a plain string or a reactive source. A reactive query is
watched, so the search re-runs whenever the term changes. The composable returns
`{ response, error, refresh }` — the first run throws on failure like the other
composables, a re-run triggered by the watched query reports through `error`.

`options` are all optional:

- `sort` — `score` (relevance, the default), `title`, `time_start` or
	`updated_at`. Prefix with `-` to reverse, for example `-updated_at` for newest
	first.
- `page` — result page, starting at 1.
- `lang` — language context, only relevant in multi-lingual setups.

An empty query resolves to an empty list without hitting the API, so it is safe
to bind straight to an input.

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

---

<details>
<summary><strong>AI coding agent instructions — Nuxt integration</strong></summary>

The file [ai-instructions-nuxt.md](ai-instructions-nuxt.md) contains a complete advisory for setting up Flyo Nitro CMS in a Nuxt project with `@flyo/nitro-nuxt`, both for a **new Nuxt 4 app** and for an **existing one**.

It is written to be pasted directly into a coding agent (Claude, Copilot, Cursor, etc.) as a system prompt or task description.

**Copy the raw instructions:**

- GitHub raw URL: `https://raw.githubusercontent.com/flyocloud/nitro-nuxt/main/ai-instructions-nuxt.md`
- Or open [ai-instructions-nuxt.md](ai-instructions-nuxt.md) and use the **Raw** button.

The advisory covers:
- Scaffolding a new Nuxt 4 app and installing the module
- Environment variables and `nuxt.config.ts` module options
- The required `pages/cms.vue` and dynamic Flyo route registration
- `TheHeader` and `TheFooter` components driven by Flyo containers
- Block components in `~/flyo`, their props, slots and `editable(block)`
- TypeScript type generation from the Flyo OpenAPI schema
- WYSIWYG and Flyo CDN image helper components
- A reusable Claude skill (`.claude/skills/flyo-blocks/SKILL.md`) for block generation
- Sitemap and search
- A validation checklist and a troubleshooting table

</details>
