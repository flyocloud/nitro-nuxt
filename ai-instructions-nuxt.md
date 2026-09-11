# Flyo Nitro CMS integration advisory for Nuxt
You are a coding agent setting up Flyo Nitro CMS in a Nuxt project using `@flyo/nitro-nuxt`.

This advisory covers both cases:

- creating a **new** Nuxt app that is driven by Flyo Nitro,
- integrating Flyo Nitro into an **existing** Nuxt app.

Repository and documentation:

- Package repository: `https://github.com/flyocloud/nitro-nuxt`
- Developer README: `https://github.com/flyocloud/nitro-nuxt/blob/main/README.md`
- Upgrade notes: `https://github.com/flyocloud/nitro-nuxt/blob/main/UPGRADE.md`
- Flyo Nuxt docs: `https://dev.flyo.cloud/nitro/nuxt`

## Important constraints
This integration requires **Nuxt 4.3.1+** and Node.js 18.12+.

`@flyo/nitro-nuxt` is a Nuxt module. It is not compatible with Nuxt 2, and Nuxt 3 is no longer supported since module v2.

Before changing files, determine the directory layout of the project:

- A Nuxt 4 project keeps its application code in `app/`, so `~` resolves to `app/`. Pages live in `app/pages/`, components in `app/components/`, block components in `app/flyo/`.
- A project migrated from Nuxt 3 that still has root level `pages/`, `layouts/` or `components/` and **no** `app/` directory keeps the legacy layout, so `~` resolves to the project root. Then the paths are `pages/`, `components/` and `flyo/`.

Every path in this advisory is written in the Nuxt 4 form (`app/…`). Drop the `app/` prefix if the project uses the legacy layout. Never mix both layouts in one project.

Use these conventions:

```
app/pages/cms.vue
app/components/TheHeader.vue
app/components/TheFooter.vue
app/components/AppWysiwyg.vue
app/components/FlyoImage.vue
app/flyo/
```
Do not hardcode secrets into source files. The Flyo API token belongs in environment variables.

Use TypeScript where the project supports it.

Prefer small, clean, reusable components.

## First interaction with the user
Before implementing, ask the user for the following required information.

### 1. Flyo Nitro API token
Ask for the Flyo API token that should be used for this project.

Store it in `.env`:

```
FLYO_API_TOKEN=<token>
FLYO_LIVE_EDIT=true
```
For production, the environment should contain:

```
FLYO_API_TOKEN=<production-token>
FLYO_LIVE_EDIT=false
```
`liveEdit` already defaults to `true` outside of `NODE_ENV=production`, so `FLYO_LIVE_EDIT` is only needed to override that default.

Make sure `.env` is listed in `.gitignore`. Do not commit real tokens.

### 2. Available Flyo container identifiers
Ask which Flyo config containers exist and should be used in the layout.

Common examples:

```
nav
navbar
navigation
main_navigation
footer
```
Ask the user specifically:

```
Which Flyo container identifier should be used for the main navigation?
Which Flyo container identifier should be used for the footer?
```
Use those identifiers in the `TheHeader` and `TheFooter` components.

The components should not be named `FlyoHeader` or `FlyoFooter`, because they are regular layout components and because `FlyoPage` and `FlyoBlock` are already taken by the SDK. Use neutral layout names:

```
app/components/TheHeader.vue
app/components/TheFooter.vue
```

### 3. New app or existing app
If the project directory is empty, follow **Step 0**. If a Nuxt app already exists, skip Step 0 and start at **Step 1**, merging the integration into the existing files instead of overwriting them.

## Implementation steps

### 0. Create the Nuxt app (new projects only)
Scaffold a Nuxt 4 app:

```
npx nuxi@latest init <project-name>
```
Then install the dependencies:

```
cd <project-name>
npm install
```
Verify the Nuxt version before continuing:

```
npm ls nuxt
```
It must be `4.3.1` or newer. Upgrade if it is not:

```
npm install nuxt@^4.3.1
```
A fresh Nuxt 4 app has no `app/pages/` directory. It is created in Step 4, which also turns on the Vue Router.

### 1. Install the package
Install the Flyo Nitro Nuxt module:

```
npm install @flyo/nitro-nuxt
```
Use the project's package manager if it is clearly not npm:

```
pnpm add @flyo/nitro-nuxt
```
or:

```
yarn add @flyo/nitro-nuxt
```
The module pulls in `@flyo/nitro-vue3` and `@flyo/nitro-typescript`. `@flyo/nitro-js-bridge` is resolved at runtime through `@flyo/nitro-vue3`. Install it explicitly only if you import from it directly, as the WYSIWYG component in Step 9 does:

```
npm install @flyo/nitro-js-bridge
```

### 2. Add the environment file
Create `.env` in the project root:

```
FLYO_API_TOKEN=<token>
FLYO_LIVE_EDIT=true
```
Optional variables:

```
FLYO_API_BASE_PATH=
FLYO_LIVE_EDIT_ORIGIN=https://flyo.cloud
```
Nuxt loads `.env` in development and during build. On a hosting platform, set the same variables in the platform's environment settings instead of shipping the file.

### 3. Register the module in `nuxt.config.ts`
Add the module with its options:

```ts
export default defineNuxtConfig({
  modules: [
    ['@flyo/nitro-nuxt', {
      apiToken: process.env.FLYO_API_TOKEN
    }]
  ]
})
```
The module reads its defaults from the environment, so passing `apiToken` explicitly is the only required part. `apiToken` is mandatory. The module throws `Missing 'FLYO_API_TOKEN' in .env` on startup if it is empty.

All module options, with their defaults:

| Option | Default | Purpose |
| --- | --- | --- |
| `apiToken` | `process.env.FLYO_API_TOKEN` | Flyo Nitro API token, required |
| `apiBasePath` | `process.env.FLYO_API_BASE_PATH` | Override the API host, rarely needed |
| `liveEdit` | `process.env.FLYO_LIVE_EDIT` or `NODE_ENV !== 'production'` | Live editing inside the Flyo preview iframe |
| `liveEditOrigin` | `process.env.FLYO_LIVE_EDIT_ORIGIN` or `https://flyo.cloud` | Origin of the Flyo editor |
| `registerPageRoutes` | `true` | Register a route for every Flyo page slug |
| `defaultPageRoute` | `'cms'` | Page component used for those routes |

Do not blindly overwrite an existing `nuxt.config.ts`. Merge the `modules` entry into the existing config and keep all other options untouched.

### 4. Create the CMS page component
With `registerPageRoutes` enabled (the default) the module registers one route per Flyo page slug at runtime and points all of them at `~/pages/cms.vue`. That file is required:

```
app/pages/cms.vue
```
Use:

```vue
<script setup lang="ts">
const { response: page } = await useFlyoCurrentPage()
</script>

<template>
  <FlyoPage :page="page" />
</template>
```
`useFlyoCurrentPage()` resolves the current route path through `useFlyoPage()`, which also sets title, description and Open Graph meta through `useSeoMeta()`.

`<FlyoPage>` and `<FlyoBlock>` are registered globally by the module's plugin, so they need no import.

`FlyoPage` renders every block of `page.json` through `FlyoBlock`, and `FlyoBlock` resolves each block's `component` name against the globally registered components. That is what makes the block directory in Step 7 work.

If you need to wrap the output, use the default slot:

```vue
<template>
  <FlyoPage :page="page">
    <template #default="{ json }">
      <article class="prose">
        <FlyoBlock v-for="item in json" :key="item.uid" :item="item" />
      </article>
    </template>
  </FlyoPage>
</template>
```
If the project already has a catch-all route or its own `pages/index.vue`, inspect the routing first. Flyo routes are added through `router.addRoute()` at plugin time and do not replace file based routes with the same path.

### 5. Create the layout with `TheHeader` and `TheFooter`
Navigation comes from the containers of the Flyo config. Ask the user for the identifiers first, as described above.

Create `app/components/TheHeader.vue`:

```vue
<script setup lang="ts">
const NAV_CONTAINER_KEY = 'nav'

const { response: config } = await useFlyoConfig()

const items = computed(() => config?.containers?.[NAV_CONTAINER_KEY]?.items ?? [])
</script>

<template>
  <header v-if="items.length">
    <nav aria-label="Main navigation">
      <ul>
        <li v-for="item in items" :key="item.href">
          <NuxtLink :to="item.href" :target="item.target">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
```
Create `app/components/TheFooter.vue` the same way with the footer identifier:

```vue
<script setup lang="ts">
const FOOTER_CONTAINER_KEY = 'footer'

const { response: config } = await useFlyoConfig()

const items = computed(() => config?.containers?.[FOOTER_CONTAINER_KEY]?.items ?? [])
</script>

<template>
  <footer v-if="items.length">
    <nav aria-label="Footer navigation">
      <ul>
        <li v-for="item in items" :key="item.href">
          <NuxtLink :to="item.href" :target="item.target">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </footer>
</template>
```
Replace `NAV_CONTAINER_KEY` and `FOOTER_CONTAINER_KEY` with the identifiers the user provided.

A container item carries `label`, `href`, `target`, `slug`, `type` and a nested `children` array. `href` is the finished link, so internal paths already come with a trailing slash and mail links arrive as `mailto:…`. Items of type `url`, `email`, `tel` or `file` point outside the app. Render those as a plain `<a>` rather than `<NuxtLink>` when the project needs correct external link handling. Render `children` recursively if the navigation is nested.

Then wire the components into the layout. Create `app/layouts/default.vue`:

```vue
<template>
  <div>
    <TheHeader />
    <main>
      <slot />
    </main>
    <TheFooter />
  </div>
</template>
```
And make sure `app/app.vue` renders layouts and pages:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```
Preserve existing fonts, meta tags, providers, analytics and styling of an existing app. Merge the Flyo parts into the existing layout instead of replacing it.

Live editing needs no setup in the layout. The module enables it through the plugin, and `FlyoPage` boots the bridge when `liveEdit` is on.

### 6. Generate Flyo TypeScript definitions (optional but recommended)
The Flyo API exposes an OpenAPI schema for the project's own block types. Generating it gives typed block content and prevents guessing field names.

Add this script to `package.json`:

```json
{
  "scripts": {
    "flyo:types": "npx -y openapi-typescript@latest 'https://api.flyo.cloud/nitro/v1/openapi/schemas?token=$FLYO_API_TOKEN' -o ./app/generated/flyo.ts --root-types --root-types-no-schema-prefix --export-type"
  }
}
```
Then run:

```
npm run flyo:types
```
The direct command is:

```
npx -y openapi-typescript@latest 'https://api.flyo.cloud/nitro/v1/openapi/schemas?token=flyotoken' -o ./app/generated/flyo.ts --root-types --root-types-no-schema-prefix --export-type
```
Replace `flyotoken` with the real Flyo API token.

If shell variable expansion inside the npm script is problematic on the current platform, run the direct command locally once. Do not commit the token.

The generated file lands in `app/generated/flyo.ts`. It is generated output, so add it to `.gitignore` only if the team regenerates it in CI. Otherwise commit it so type checks pass without a token.

### 7. Set up the block components directory
The module registers `~/flyo` as a global components directory with `pathPrefix: false`. Create it:

```
app/flyo/
```
Every file in there becomes a globally available component whose name is the file name, without any directory prefix. `FlyoBlock` resolves a block's `component` value against exactly these names, so a Flyo block annotated as `TextBlock` needs `app/flyo/TextBlock.vue`.

Each block component receives these props from `FlyoBlock`:

| Prop | Content |
| --- | --- |
| `block` | The whole block object, including `uid`, `identifier` and `component` |
| `config` | Block configuration, used for style and layout variants |
| `content` | The block's content fields |
| `items` | Items mapped from content pools, each with a generated `link` |
| `slots` | Nested slots, keyed by slot identifier, each with a `content` array of blocks |

A minimal block component:

```vue
<script setup lang="ts">
defineProps<{
  block: Record<string, any>
  content: Record<string, any>
}>()
</script>

<template>
  <section v-bind="editable(block)">
    <h2>{{ content?.title }}</h2>
    <p>{{ content?.teaser }}</p>
  </section>
</template>
```
`editable(block)` is auto-imported by the module. It returns `{ 'data-flyo-uid': block.uid }` and makes the block discoverable for hover highlighting and click-to-edit inside the Flyo editor. It is safe to include unconditionally, because it yields an empty object when the block has no uid, and it has no effect when live editing is off. Put it on the root element of every block component.

A block with nested slots renders them through `FlyoBlock`:

```vue
<script setup lang="ts">
defineProps<{
  block: Record<string, any>
  slots: Record<string, any>
}>()
</script>

<template>
  <section v-bind="editable(block)">
    <FlyoBlock
      v-for="child in slots?.content?.content ?? []"
      :key="child.uid"
      :item="child"
    />
  </section>
</template>
```
The outer key is the slot identifier defined in Flyo, the inner `content` is the array of child blocks.

Do not invent block components for block types that do not exist in the Flyo project. Ask the user which blocks exist, or read the generated types from Step 6.

### 8. Create a WYSIWYG component
Most Flyo projects use WYSIWYG fields, which arrive as ProseMirror/TipTap JSON. `@flyo/nitro-js-bridge` renders that JSON to HTML.

Create `app/components/AppWysiwyg.vue`:

```vue
<script setup lang="ts">
import { wysiwyg } from '@flyo/nitro-js-bridge'

const props = withDefaults(defineProps<{
  json: any
  class?: string
}>(), {
  class: 'wysiwyg'
})

const html = computed(() => (props.json ? wysiwyg(props.json) : ''))
</script>

<template>
  <div :class="props.class" v-html="html" />
</template>
```
Use it wherever a block carries WYSIWYG JSON:

```vue
<AppWysiwyg v-if="content?.text" :json="content.text" />
```
`wysiwyg(json, nodeRenderers, markRenderers)` takes optional renderer maps to override single node or mark types, for example to render images or links with project specific markup:

```ts
const html = computed(() => wysiwyg(props.json, {
  image: ({ attrs }: any) => `<img src="${attrs.src}" loading="lazy" alt="">`
}))
```
The rendered HTML comes from the CMS, so treat the Flyo project as a trusted source. Do not pass arbitrary user input through this component.

### 9. Create an image component for the Flyo CDN
Flyo media is served from `storage.flyo.cloud`, which resizes and converts on the fly through the query parameters `w`, `h` and `format`.

Create `app/components/FlyoImage.vue`:

```vue
<script setup lang="ts">
const CDN_HOST = 'storage.flyo.cloud'

const props = defineProps<{
  src: string
  alt?: string
  width?: number
  height?: number
  format?: string
}>()

const url = computed(() => {
  if (!props.src) {
    return ''
  }

  const base = props.src.includes(CDN_HOST)
    ? props.src
    : `https://${CDN_HOST}/${props.src.replace(/^\//, '')}`

  const params = new URLSearchParams()

  if (props.width) {
    params.set('w', String(Math.max(1, Math.round(props.width))))
  }

  if (props.height) {
    params.set('h', String(Math.max(1, Math.round(props.height))))
  }

  params.set('format', props.format ?? 'webp')

  return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`
})
</script>

<template>
  <img
    :src="url"
    :alt="alt ?? ''"
    :width="width"
    :height="height"
    loading="lazy"
    decoding="async"
  >
</template>
```
Use it inside block components:

```vue
<FlyoImage
  v-if="content?.image?.source"
  :src="content.image.source"
  :alt="content.image.caption || ''"
  :width="800"
  :height="600"
/>
```
If the project already uses `@nuxt/image`, keep that component and only point it at the CDN URL instead of adding a second image abstraction.

### 10. Create a reusable Claude skill for Flyo block generation
Do not leave the block conventions in this advisory only. Create a reusable skill that future agents pick up whenever they generate Flyo blocks for this project.

Create:

```
.claude/skills/flyo-blocks/SKILL.md
```
Use this content:

````
---
name: flyo-blocks
description: Generate Flyo Nitro CMS block components for this Nuxt project in app/flyo.
---

# Flyo block generation skill

Use this skill when creating or updating Flyo Nitro CMS block components.

## Project context

This project uses:

```txt
Nuxt 4
@flyo/nitro-nuxt
Application code in app/
```

Flyo block components belong in:

```txt
app/flyo
```

That directory is registered by the module as a global components directory with
`pathPrefix: false`, so the file name is the component name. `FlyoBlock` resolves
a block's `component` value against those names, so `app/flyo/TextBlock.vue`
serves a Flyo block annotated as `TextBlock`.

Shared helpers are available at:

```txt
app/components/AppWysiwyg.vue
app/components/FlyoImage.vue
```

Generated Flyo types, if they were generated, live at:

```txt
app/generated/flyo.ts
```

## Main task

When asked to generate Flyo blocks:

1. Inspect `app/generated/flyo.ts` if it exists, otherwise ask which blocks exist.
2. Identify the available Flyo block types and their `component` names.
3. Create matching Vue components in `app/flyo`, one file per block type.
4. Name every file exactly like the block's `component` value.
5. Bind `editable(block)` on the root element of each block component.
6. Use `AppWysiwyg` for WYSIWYG JSON fields.
7. Use `FlyoImage` for Flyo media fields.
8. Render nested slots with `FlyoBlock`.
9. Keep the implementation minimal and type-safe.

## Important rules

Always inspect the generated types before creating a block.

Do not guess field names when generated type definitions are available.

Use optional chaining for CMS fields unless the generated type guarantees the field.

Do not register block components anywhere. The module picks up `app/flyo`
automatically, and manual registration produces duplicate component warnings.

Keep block components small and readable.

Do not add styling beyond the project's existing design system conventions.

Prefer existing project components, typography helpers, buttons and layout
primitives if they already exist.

## Block component pattern

```vue
<script setup lang="ts">
defineProps<{
  block: Record<string, any>
  config: Record<string, any>
  content: Record<string, any>
  items: any[]
  slots: Record<string, any>
}>()
</script>

<template>
  <section v-bind="editable(block)">
    <h2 v-if="content?.title">{{ content.title }}</h2>
    <AppWysiwyg v-if="content?.text" :json="content.text" />
  </section>
</template>
```

Declare only the props the block actually reads.

## Slot pattern

```vue
<template>
  <section v-bind="editable(block)">
    <FlyoBlock
      v-for="child in slots?.content?.content ?? []"
      :key="child.uid"
      :item="child"
    />
  </section>
</template>
```

The outer key is the slot identifier from Flyo, the inner `content` is the array
of child blocks.

## Items pattern

`items` holds entries mapped from content pools. Each entry carries a generated
`link` to its detail page unless the mapping defines its own link field.

```vue
<template>
  <ul>
    <li v-for="item in items ?? []" :key="item.id">
      <NuxtLink :to="item.link">{{ item.title }}</NuxtLink>
    </li>
  </ul>
</template>
```

## Image usage

```vue
<FlyoImage
  v-if="content?.image?.source"
  :src="content.image.source"
  :alt="content.image.caption || ''"
  :width="800"
  :height="600"
/>
```

## Final checklist after generating blocks

- Block files exist in `app/flyo`, one per block type.
- Every file name matches the block's `component` value.
- Every root element binds `editable(block)`.
- WYSIWYG fields use `AppWysiwyg`.
- Images use `FlyoImage`.
- Nested slots render through `FlyoBlock`.
- No block component is registered manually.
- `npm run build` passes.
````

### 11. Add sitemap support
`useFlyoSitemap()` returns every page from the containers plus every mapped entity, including all language variants. Each item carries `href`, the finished link, and `updated_at`, a Unix timestamp meant for `lastmod`. Items without an `href` have no reachable URL and must be skipped.

The composable runs inside the Nuxt app, where the plugin configured the SDK. It is **not** available in a Nitro `server/` route, so `server/routes/sitemap.xml.ts` cannot use it.

Render the sitemap from a page instead. Create `app/pages/sitemap.xml.vue`:

```vue
<script setup lang="ts">
const SITE_URL = 'https://example.com'

const { response } = await useFlyoSitemap()

const xml = computed(() => {
  const urls = (response.value ?? [])
    .filter((item: any) => item.href)
    .map((item: any) => `  <url>
    <loc>${new URL(item.href, SITE_URL).href}</loc>
    <lastmod>${new Date(item.updated_at * 1000).toISOString()}</lastmod>
  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/schemas/sitemap/0.9">
${urls}
</urlset>`
})
</script>

<template>
  <pre>{{ xml }}</pre>
</template>
```
Move `SITE_URL` into a runtime config value or an environment variable rather than hardcoding it in a real project.

The alternative is `@nuxtjs/sitemap`. Feed it the same entries and let it handle the XML:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: process.env.SITE_URL
  }
})
```
Then supply the URLs from a Nuxt app context, not from a Nitro hook, for the reason above.

### 12. Add search (optional)
`useFlyoSearch(query, options)` runs a full-text search across pages and entities. Results share the sitemap item shape, so a hit links through its `href`.

Create `app/pages/search.vue`:

```vue
<script setup lang="ts">
const query = ref('')
const { response: hits, error } = await useFlyoSearch(query)
</script>

<template>
  <div>
    <input v-model="query" type="search" placeholder="Search">
    <p v-if="error">Search failed.</p>
    <ul>
      <li v-for="hit in hits ?? []" :key="hit.entity_unique_id">
        <a :href="hit.href">{{ hit.entity_title }}</a>
        <p>{{ hit.entity_teaser }}</p>
      </li>
    </ul>
  </div>
</template>
```
The query may be a plain string or a reactive source. A reactive query is watched, so the search re-runs on every change. An empty query resolves to an empty list without hitting the API, so binding it straight to an input is safe.

`options` accepts `sort` (`score`, `title`, `time_start`, `updated_at`, each reversible with a `-` prefix), `page` and `lang`.

The first run throws on failure like the other composables. A re-run triggered by the watched query reports through the returned `error` ref.

### 13. Auto-imported composables
The module auto-imports these, so they need no import statement:

| Composable | Purpose |
| --- | --- |
| `useFlyoConfig()` | Global config: containers, page slugs, globals |
| `useFlyoCurrentPage()` | The page for the current route |
| `useFlyoPage(slug)` | A page by slug, also sets SEO meta |
| `useFlyoEntity(uniqueId)` | A single entity, also sends the Flyo metric request |
| `useFlyoSitemap()` | Full sitemap of pages and entities |
| `useFlyoSearch(query, options)` | Full-text search |
| `editable(block)` | `data-flyo-uid` binding for live editing |

All of them are async and return `{ response, … }`. They throw on a failed request, so wrap them in an error boundary or a `try/catch` where a failure should not take the page down.

Use `useFlyoEntity()` for detail pages of mapped entities, typically from a dynamic route such as `app/pages/detail/[uid].vue`:

```vue
<script setup lang="ts">
const route = useRoute()
const { response: entity } = await useFlyoEntity(route.params.uid as string)
</script>
```

### 14. Validation checklist
After implementation, run:

```
npm run build
```
Run the project's lint and type-check scripts too if they exist:

```
npm run lint
npx nuxi typecheck
```
Then verify:

```
.env contains FLYO_API_TOKEN and .env is gitignored
nuxt.config.ts registers @flyo/nitro-nuxt with apiToken
app/pages/cms.vue exists and renders <FlyoPage>
app/app.vue renders <NuxtLayout> and <NuxtPage>
app/layouts/default.vue includes TheHeader and TheFooter
TheHeader and TheFooter use the container identifiers the user provided
app/flyo/ exists and holds one component per Flyo block type
every block component binds editable(block) on its root element
app/components/AppWysiwyg.vue exists if the project uses WYSIWYG fields
app/components/FlyoImage.vue exists if the project renders Flyo media
.claude/skills/flyo-blocks/SKILL.md exists
the project builds successfully
```
Finally start the dev server and open a Flyo page path:

```
npm run dev
```

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Missing 'FLYO_API_TOKEN' in .env` on startup | The module got an empty `apiToken`. Check `.env` and the `nuxt.config.ts` entry. |
| `Cannot find module '~/pages/cms.vue'` | `registerPageRoutes` is on but the page is missing. Create `app/pages/cms.vue`, or set `registerPageRoutes: false`. |
| A Flyo page renders a 404 | The slug is not in `config.pages`, or `registerPageRoutes` is off. Inspect `useFlyoConfig()` output. |
| Blocks render as empty or unknown elements | No component in `app/flyo` matches the block's `component` value. Names are case sensitive. |
| Live edit shows «no connection to the live preview» | `liveEdit` is off, or `@flyo/nitro-js-bridge` is older than 1.5.0. Check `NODE_ENV`, `FLYO_LIVE_EDIT` and the installed bridge version. |
| Clicking a block in the editor does nothing | The block component does not bind `editable(block)` on an element. |
| The page hard-reloads in the editor and drops the connection | A dependency was discovered lazily by Vite. The module pre-bundles the Flyo packages, so check for other imports added to the block components. |

## Follow-up workflow after setup
After the base integration is complete, generate the real Flyo block components.

Use the created skill:

```
.claude/skills/flyo-blocks/SKILL.md
```
Then ask the agent:

```
Use the flyo-blocks skill. Inspect the available Flyo block types, generate all missing block components in app/flyo, and use AppWysiwyg and FlyoImage where appropriate.
```
