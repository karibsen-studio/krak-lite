# Krak-Lite

![Krak Lite OG Image](https://raw.githubusercontent.com/karibsen-studio/krak-lite/main/.github/assets/cover.png)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@karibsen/krak-lite-nuxt.svg?style=flat&colorA=020420&colorB=00DC82&label=size)](https://bundlephobia.com/package/@karibsen/krak-lite-nuxt)
[![Nuxt][nuxt-src]][nuxt-href]

Lightweight, privacy-first analytics module for Nuxt.

krak-lite batches actions client-side and ships them to **your own** endpoint - no third-party servers, no cookies, no persistent identifiers. The session id lives in memory only and is gone on reload, so a visitor can never be tied back across page lifetimes.

## Features

- 🪶 &nbsp;Tiny, zero-dependency client (queue + batched flush)
- 🔒 &nbsp;Privacy-first: in-memory anonymous session, no cookies / storage
- 🚫 &nbsp;Respects the browser's **Do Not Track** signal
- 🧹 &nbsp;Strips query strings from tracked paths automatically
- 🖱 &nbsp;Declarative click tracking via `data-krak-*` attributes
- 📄 &nbsp;Optional automatic `page_view` tracking
- 🔁 &nbsp;Built-in retry with backoff and a capped queue
- 📡 &nbsp;Reliable last-batch delivery via `navigator.sendBeacon` on page hide

## Quick Setup

Install the module:

```bash
npx nuxt module add @karibsen/krak-lite-nuxt
```

Or manually:

```bash
npm install @karibsen/krak-lite-nuxt
# pnpm add @karibsen/krak-lite-nuxt
# yarn add @karibsen/krak-lite-nuxt
```

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@karibsen/krak-lite-nuxt'],

  krakLite: {
    endpoint: '/api/analytics/actions',
    source: 'my-app',
    autoPageView: true,
  },
})
```

That's it ✨

## Configuration

All options live under the `krakLite` key. Defaults shown below.

```ts
krakLite: {
  enabled: true,                        // master switch
  endpoint: '/api/analytics/actions',    // where batches are POSTed
  source: 'unknown',                    // tag every action with its origin
  maxQueueSize: 100,                    // oldest action dropped past this
  flushInterval: 30_000,                // ms between automatic flushes
  debug: false,                         // log queue/flush activity
  autoPageView: false,                  // track `page_view` on route change
  autoCapture: true,                    // honor data-krak-* click attributes
  respectDoNotTrack: true,              // skip tracking when DNT is on
  referrer: false,                      // add query-stripped referrer to page_view
  retry: 3,                             // extra send attempts after a failure
  retryAfter: 5_000,                    // ms before retrying a failed batch
}
```

## Usage

### Programmatic tracking

Use the auto-imported `useKrakLite` composable:

```vue
<script setup lang="ts">
const { track, flush } = useKrakLite()

function onSubscribe() {
  track('cc', { plan: 'pro', price: 29 })
}

function onCheckout() {
  // send right away instead of waiting for the next flush
  track('form_submit', { form: 'checkout' }, { immediate: true })
}
</script>
```

`track(actionName, data?, options?)`:

| Argument     | Type                                  | Description                                     |
|--------------| ------------------------------------- |-------------------------------------------------|
| `actionName` | `string`                              | Free-form, or one of the built-in action names. |
| `meta`       | `Record<string, unknown>`             | Optional structured payload.                    |
| `options`    | `{ immediate?, retry?, retryAfter? }` | Flush now and/or override retry settings.       |

`flush(options?)` forces the queue to be sent; pass `{ preferBeacon: true }` to use `navigator.sendBeacon`.

Built-in action names are exported for convenience:

```ts
import { KRAK_LITE_ACTIONS } from '@karibsen/krak-lite-nuxt'
// pv, cc
```

### Typed custom events

`track()` accepts any string, but you can register your own event names to get
**autocomplete** on the action name and a **typed `meta` payload**. krak-lite
exposes a global `KrakLiteEventRegistry` interface - augment it from any `.d.ts`
in your project (e.g. `types/krak-lite.d.ts`):

```ts
// types/krak-lite.d.ts
export {}

declare global {
  interface KrakLiteEventRegistry {
    purchase: { amount: number, currency: string }
    newsletter_signup: { plan: string }
  }
}
```

Each key becomes a suggested action name, and its value types the `meta` argument:

```ts
const { track } = useKrakLite()

track('purchase', { amount: 29, currency: 'EUR' }) // autocompleted + checked
track('purchase', { amount: 29 })                  // `currency` is missing
track('anything-else', { foo: 1 })                 // unregistered names still allowed
```

> The registry is **global** on purpose: `track`'s action-name type is computed
> from it internally, and a global interface merges reliably regardless of how
> the package is imported. Augmenting `declare module '@karibsen/krak-lite-nuxt'`
> instead would **not** work, because the package only re-exports the interface.

### Declarative click tracking

With `autoCapture` enabled (default), any click on an element carrying
`data-krak-action` is tracked - no JavaScript required:

```html
<button
  data-krak-action="cc"
  data-krak-data-plan="pro"
  data-krak-data-price="29"
  data-krak-immediate
>
  Subscribe
</button>
<!--
  data-krak-data-plan  -> data: { plan: "pro" }
  data-krak-data-price -> data: { price: 29 }   (coerced to a number)
  data-krak-immediate  -> flush right away
-->
```

`data-krak-data-*` values are coerced to `boolean` / `number` when they look
like one.

### Sensitive data is stripped

Sensitive keys (`email`, `phone`, `name`, `address`, `userId`, `password`,
`token`, `cardNumber`, …) are **removed from every `meta` payload** before it is
queued - whether the action was tracked programmatically via `track()` or
declaratively via `data-krak-*`. Matching is case-insensitive and applies at any
nesting depth:

```ts
track('cc', { plan: 'pro', email: 'a@b.com', user: { id: 1, name: 'Ada' } })
// queued meta -> { plan: 'pro', user: { id: 1 } }
```

This is a safety net, not a license to send PII - krak-lite is designed to be
fed non-personal data in the first place.

### Per-page options

With `autoPageView` enabled, every route change emits a `pv`. You can
opt a specific page out via `definePageMeta`:

```vue
<script setup lang="ts">
definePageMeta({
  krakLite: { pageView: false },
})
</script>
```

This only disables the **automatic** `pv` for that route - you can still
call `useKrakLite().pageView()` manually if needed.

### Referrer

Set `referrer: true` to attach where the visitor came from to each `page_view`,
under `meta.ref`:

```ts
krakLite: { autoPageView: true, referrer: true }
// page_view meta -> { title: "…", ref: "https://google.com/search" }
```

The referrer is reduced to **origin + path only** - the query string and hash
are stripped so no sensitive parameters leak. It is **off by default**: it is not
a user identifier and, since krak-lite keeps no persistent storage, it cannot be
used to link visits - but it does add to the data you collect, so it stays opt-in.

## Receiving actions

Actions are POSTed to your `endpoint` as a single JSON batch:

```jsonc
{
  "v": 1,
  "s": "my-app",
  "d": [
    {
      "a": "pv",      // action name
      "t": 1718136000000,    // timestamp (ms)
      "p": "/pricing",       // path (query string stripped)
      "s": "my-app",         // source
      "sid": "…",            // in-memory anonymous session id
      "meta": { }            // optional payload
    }
  ]
}
```

A minimal Nitro handler:

```ts
// server/api/analytics/actions.post.ts
export default defineEventHandler(async (event) => {
  const batch = await readBody(event)
  // persist batch.ev …
  return null
})
```

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  pnpm install

  # Generate type stubs
  pnpm dev:prepare

  # Develop with the playground
  pnpm dev

  # Build the playground
  pnpm dev:build

  # Run ESLint
  pnpm lint

  # Run Vitest
  pnpm test
  pnpm test:watch

  # Release a new version
  pnpm release
  ```

</details>

## License

[MIT](https://opensource.org/licenses/MIT) © D3ller

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@karibsen/krak-lite-nuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@karibsen/krak-lite-nuxt

[npm-downloads-src]: https://img.shields.io/npm/dm/@karibsen/krak-lite-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@karibsen/krak-lite-nuxt

[license-src]: https://img.shields.io/npm/l/@karibsen/krak-lite-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@karibsen/krak-lite-nuxt

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
