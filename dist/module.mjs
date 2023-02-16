import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';

function isObject(value) {
  return value !== null && typeof value === "object";
}
function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isObject(value) && isObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();

const module = defineNuxtModule({
  meta: {
    name: "@flyodev/nitrocms-nuxt3",
    configKey: "flyo"
  },
  defaults: {
    token: process.env.FLYO_TOKEN
  },
  async setup(options, nuxt) {
    if (!options.token) {
      throw new Error("Missing `FLYO_TOKEN` in `.env`");
    }
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime");
    nuxt.options.build.transpile.push(runtimeDir);
    addPlugin(resolve(runtimeDir, "flyo.plugin"));
    nuxt.options.runtimeConfig.public.flyo = defu(nuxt.options.runtimeConfig.flyo, {
      token: options.token
    });
  }
});

export { module as default };
