# Upgrade Guide: @flyo/nitro-nuxt

## From v2.2 to v2.3

v2.3 moves the pinned SDKs forward, adds a search composable, and drops the
argument `useFlyoSitemap()` never used. Every other composable and module option
keeps its signature.

| Dependency | v2.2 | v2.3 |
| --- | --- | --- |
| `@flyo/nitro-vue3` | `^2.4.0` | `^2.5.0` |
| `@flyo/nitro-typescript` | (transitive `^1.4.0`) | direct `^1.7.0` |
| `@flyo/nitro-js-bridge` | transitive `^1.4.0` | transitive `^1.5.0` |

`@flyo/nitro-typescript` is now a direct dependency because `useFlyoSearch()`
talks to the SDK's `SearchApi`. It is also pre-bundled by Vite alongside
`@flyo/nitro-vue3` and the bridge, so it is not discovered lazily on the first
client import — a lazy discovery re-optimizes and hard-reloads the page, which
drops the live-edit connection inside the Flyo preview iframe.

### `useFlyoSitemap()` no longer takes an argument

The composable declared a required `uniqueId` parameter it never read. It is
gone, so the signature matches the one the README always documented:

```diff
-const { response } = await useFlyoSitemap('some-id')
+const { response } = await useFlyoSitemap()
```

⚠️ **Check this** if you call it from TypeScript and pass something — the
argument was ignored at runtime, but the call now fails to type-check.

### Build a sitemap from `href` and `updated_at`

Sitemap items carry both values a sitemap entry needs. `href` is the finished
link — internal paths come with a trailing slash, mail links as `mailto:…` — and
`updated_at` is a Unix timestamp of the last content change, made for `lastmod`
(a rebuild that produces identical output does not move it). Items without an
`href` have no reachable URL and must be skipped.

```js
const { response } = await useFlyoSitemap()

const urls = response.value
  .filter(item => item.href)
  .map(item => ({
    loc: item.href,
    lastmod: new Date(item.updated_at * 1000).toISOString()
  }))
```

`routes` is the raw map of route identifiers behind that `href`; reach for it
only when you need a specific named route.

The composable runs inside the Nuxt app, where the Flyo plugin has configured
the SDK — it is not available in a Nitro `server/` route.

### New: `useFlyoSearch(query, options)`

Full-text search across pages and entities, auto-imported like the other
composables. Results share the sitemap item shape, so a hit links through its
`href` and carries an `updated_at` timestamp:

```vue
<script setup lang="ts">
const query = ref('')
const { response: hits } = await useFlyoSearch(query, { sort: '-score' })
</script>

<template>
  <input v-model="query">
  <a v-for="hit in hits" :key="hit.entity_unique_id" :href="hit.href">
    {{ hit.entity_title }}
  </a>
</template>
```

The query may be a plain string or a reactive source; a reactive query is
watched and re-runs the search on change, reporting a failure through the
returned `error` ref rather than throwing. `options` accepts `sort` (`score`,
`title`, `time_start`, `updated_at`, each reversible with a `-` prefix), `page`
and `lang`. An empty query resolves to an empty list without hitting the API, so
it is safe to bind straight to an input.

### `routes` keeps an explicit `null`

The API sends a `routes` map per sitemap item, carrying the resolved URL paths
plus a system key `_empty`. When `_empty` arrives as an explicit `null`, the SDK
used to drop the key; it now preserves it.

```js
const { response } = await useFlyoSitemap()

// v2.2: { }
// v2.3: { _empty: null }
response.value[1].routes
```

⚠️ **Check this** if you test the key's presence rather than its value —
`'_empty' in routes` and `Object.keys(routes).length` now see the key:

```js
// before
if ('_empty' in routes) { … }

// after — treats a missing key and an explicit null alike
if (routes._empty != null) { … }
```

Reading a route path (`routes.detail`) is unchanged, and `_empty: false` /
`_empty: true` were always passed through untouched.

### `routes` is typed `{ [key: string]: any }`

For TypeScript consumers of the SDK response types:

| Type | v2.2 | v2.3 |
| --- | --- | --- |
| `FlyoSitemapResponse[number].routes` | `Routes` | `{ [key: string]: any }` |
| `FlyoEntityResponse.entity.routes` | `{ [key: string]: string }` | `{ [key: string]: any }` |

The old `{ [key: string]: string }` was wrong — `_empty` is a boolean — so
`routes._empty` no longer needs a cast to be used as one. Reading a path still
type-checks as a `string`, but you lose `string` inference on the values, so add
a guard where the key is dynamic:

```ts
const path = routes[key]
if (typeof path !== 'string') return undefined
```

The `Routes` type itself was removed from `@flyo/nitro-typescript`. This module
never re-exported it, so only a direct
`import type { Routes } from '@flyo/nitro-typescript'` in your own code stops
compiling — replace the annotation with `{ [key: string]: any }`.

### `meta_json.image` is typed `boolean | string`

The SDK now models a missing meta image as `false` rather than an absent
string, so `Meta.image` is the union `MetaImage = boolean | string`. Guard it
before passing it to a meta tag:

```ts
const image = typeof page.meta_json.image === 'string' ? page.meta_json.image : undefined
```

### `liveEdit: true` outside the Flyo editor no longer errors

When live-edit was enabled on a page that is *not* rendered inside the Flyo
preview iframe, every re-wire and every unmount posted an `openEdit` message to
the page's own window. The browser rejected it against the editor's target
origin and logged:

> Failed to execute 'postMessage' on 'DOMWindow': The target origin provided
> ('https://flyo.cloud') does not match the recipient window's origin (…).

`@flyo/nitro-vue3` now wires the hover affordance only when the page really is
embedded in the editor, so those errors are gone. Behaviour inside the editor is
unchanged, and no module option changed — `liveEdit` still defaults to on
outside production.

## From v1 to v2

This section helps you upgrade from `@flyo/nitro-nuxt v1` to `v2`.

### Key Changes in v2

#### 1. **Nuxt 4 Compatibility**
- Module now requires **Nuxt 4.3.1+** (upgraded from Nuxt 3)
- @nuxt/kit updated to v4.3.1
- All module composition APIs are Nuxt 4 compatible

**Migration:** Update your `nuxt.config.ts` to use Nuxt 4:
```bash
npm install nuxt@^4.3.1 @nuxt/kit@^4.3.1
```

#### 2. **@flyo/nitro-vue3 v2 Upgrade**
- `@flyo/nitro-vue3` dependency upgraded from ^1.0.2 to ^2.0.0
- Plugin initialization remains the same via `vueApp.use(FlyoVue, { ... })`
- All composables maintain backward compatibility:
  - `useFlyoConfig()`
  - `useFlyoPage(slug)`
  - `useFlyoEntity(uniqueId)`
  - `useFlyoCurrentPage()`
  - `useFlyoSitemap()`

**No action required** for composable usage if using v1.

#### 3. **Runtime Output Changes**
- Module builds now output `.mjs` only (no CommonJS `.cjs`)
- TypeScript definitions are `.d.mts` format
- Build size optimized: 6.36 kB total

**Migration:** If you import from dist directly, ensure your bundler supports ES modules:
```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/module.mjs",
      "types": "./dist/module.d.mts"
    }
  }
}
```

#### 4. **dist Folder No Longer Committed**
- `dist/` is now in `.gitignore`
- Module is built during GitHub Actions release workflow
- CI automatically generates and publishes dist files

**Impact:** Releases are now reproducible and tamper-proof. No need to manage dist manually.

### Installation

#### Update Package
```bash
npm install @flyo/nitro-nuxt@^2.0.0
```

#### Verify Module Options
Ensure your `nuxt.config.ts` uses valid module options:

```ts
export default defineNuxtConfig({
  modules: [
    ['@flyo/nitro-nuxt', {
      apiToken: process.env.FLYO_API_TOKEN,
      apiBasePath: process.env.FLYO_API_BASE_PATH,
      liveEdit: true,
      liveEditOrigin: 'https://flyo.cloud',
      registerPageRoutes: true,
      defaultPageRoute: 'cms'
    }]
  ]
})
```

#### Required: Create `pages/cms.vue`
If `registerPageRoutes: true` (default), create the dynamic route handler:

**pages/cms.vue:**
```vue
<script setup lang="ts">
const { response: page } = await useFlyoCurrentPage()
</script>

<template>
  <div>
    <h1>{{ page?.title }}</h1>
    <!-- Your CMS content here -->
  </div>
</template>
```

### Environment Variables

No changes from v1. Continue using:

```bash
FLYO_API_TOKEN=your-token
FLYO_API_BASE_PATH=https://api.flyo.test
FLYO_LIVE_EDIT=true
FLYO_LIVE_EDIT_ORIGIN=https://flyo.cloud
```

### Testing & Build

Verify everything works:

```bash
npm run test      # Run unit tests
npm run build     # Build module
npm run playground:build  # Verify playground integration
```

### Breaking Changes from v1 → v2

#### Module Behavior
- ✅ Plugin initialization unchanged
- ✅ Composable signatures unchanged
- ✅ Runtime config keys unchanged
- ✅ Environment variable names unchanged

#### Build System
- **BREAKING:** Module is now ESM-only (no CommonJS)
- **BREAKING:** Nuxt 3 is no longer supported (Nuxt 4+ required)
- **BREAKING:** dist folder no longer in git (built by CI)

#### For Consumers
If you're using this module as a dependency:
1. Ensure your app uses **Nuxt 4.3.1+**
2. Your bundler must support **ES modules**
3. Composables work the same; no code changes needed

### Troubleshooting

#### Error: "Missing `FLYO_API_TOKEN`"
Ensure your `.env` file has:
```bash
FLYO_API_TOKEN=your-actual-token
```

#### Error: "Cannot find module `~/pages/cms.vue`"
Create the required page file:
```bash
touch pages/cms.vue
```

#### Build fails with "dist not found"
Run the build first:
```bash
npm run build
```

### Support

For issues with:
- **This Nuxt module:** Check [GitHub repo](https://github.com/flyocloud/nitro-nuxt)
- **@flyo/nitro-vue3:** See [@flyo/nitro-vue3 docs](https://github.com/flyocloud/nitro-vue3)
- **Nuxt 4:** Visit [Nuxt docs](https://nuxt.com)
