# Upgrade Guide: @flyo/nitro-nuxt v2

This guide helps you upgrade from `@flyo/nitro-nuxt v1` to `v2`.

## Key Changes in v2

### 1. **Nuxt 4 Compatibility**
- Module now requires **Nuxt 4.3.1+** (upgraded from Nuxt 3)
- @nuxt/kit updated to v4.3.1
- All module composition APIs are Nuxt 4 compatible

**Migration:** Update your `nuxt.config.ts` to use Nuxt 4:
```bash
npm install nuxt@^4.3.1 @nuxt/kit@^4.3.1
```

### 2. **@flyo/nitro-vue3 v2 Upgrade**
- `@flyo/nitro-vue3` dependency upgraded from ^1.0.2 to ^2.0.0
- Plugin initialization remains the same via `vueApp.use(FlyoVue, { ... })`
- All composables maintain backward compatibility:
  - `useFlyoConfig()`
  - `useFlyoPage(slug)`
  - `useFlyoEntity(uniqueId)`
  - `useFlyoCurrentPage()`
  - `useFlyoSitemap()`

**No action required** for composable usage if using v1.

### 3. **Runtime Output Changes**
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

### 4. **dist Folder No Longer Committed**
- `dist/` is now in `.gitignore`
- Module is built during GitHub Actions release workflow
- CI automatically generates and publishes dist files

**Impact:** Releases are now reproducible and tamper-proof. No need to manage dist manually.

## Installation

### Update Package
```bash
npm install @flyo/nitro-nuxt@^2.0.0
```

### Verify Module Options
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

### Required: Create `pages/cms.vue`
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

## Environment Variables

No changes from v1. Continue using:

```bash
FLYO_API_TOKEN=your-token
FLYO_API_BASE_PATH=https://api.flyo.test
FLYO_LIVE_EDIT=true
FLYO_LIVE_EDIT_ORIGIN=https://flyo.cloud
```

## Testing & Build

Verify everything works:

```bash
npm run test      # Run unit tests (11 tests)
npm run build     # Build module
npm run playground:build  # Verify playground integration
```

## Breaking Changes from v1 → v2

### Module Behavior
- ✅ Plugin initialization unchanged
- ✅ Composable signatures unchanged
- ✅ Runtime config keys unchanged
- ✅ Environment variable names unchanged

### Build System
- **BREAKING:** Module is now ESM-only (no CommonJS)
- **BREAKING:** Nuxt 3 is no longer supported (Nuxt 4+ required)
- **BREAKING:** dist folder no longer in git (built by CI)

### For Consumers
If you're using this module as a dependency:
1. Ensure your app uses **Nuxt 4.3.1+**
2. Your bundler must support **ES modules**
3. Composables work the same; no code changes needed

## Troubleshooting

### Error: "Missing `FLYO_API_TOKEN`"
Ensure your `.env` file has:
```bash
FLYO_API_TOKEN=your-actual-token
```

### Error: "Cannot find module `~/pages/cms.vue`"
Create the required page file:
```bash
touch pages/cms.vue
```

### Build fails with "dist not found"
Run the build first:
```bash
npm run build
```

## Support

For issues with:
- **This Nuxt module:** Check [GitHub repo](https://github.com/flyocloud/nitro-nuxt)
- **@flyo/nitro-vue3:** See [@flyo/nitro-vue3 docs](https://github.com/flyocloud/nitro-vue3)
- **Nuxt 4:** Visit [Nuxt docs](https://nuxt.com)
