# Krak-Lite

![Krak Lite OG Image](https://raw.githubusercontent.com/karibsen-studio/krak-lite/main/.github/assets/cover.png)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Lightweight, privacy-first analytics module for Nuxt.

krak-lite batches events client-side and ships them to **your own** endpoint — no third-party servers, no cookies, no persistent identifiers. The session id lives in memory only and is gone on reload, so a visitor can never be tied back across page lifetimes.

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
    endpoint: '/api/analytics/events',
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
  endpoint: '/api/analytics/events',    // where batches are POSTed
  source: 'unknown',                    // tag every event with its origin
  maxQueueSize: 100,                    // oldest events dropped past this
  flushInterval: 30_000,                // ms between automatic flushes
  debug: false,                         // log queue/flush activity
  autoPageView: false,                  // track `page_view` on route change
  autoCapture: true,                    // honor data-krak-* click attributes
  respectDoNotTrack: true,              // skip tracking when DNT is on
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
  track('cta_click', { plan: 'pro', price: 29 })
}

function onCheckout() {
  // send right away instead of waiting for the next flush
  track('form_submit', { form: 'checkout' }, { immediate: true })
}
</script>
```

`track(eventName, data?, options?)`:

| Argument    | Type                                  | Description                                    |
| ----------- | ------------------------------------- | ---------------------------------------------- |
| `eventName` | `string`                              | Free-form, or one of the built-in event names. |
| `data`      | `Record<string, unknown>`             | Optional structured payload.                   |
| `options`   | `{ immediate?, retry?, retryAfter? }` | Flush now and/or override retry settings.      |

`flush(options?)` forces the queue to be sent; pass `{ preferBeacon: true }` to use `navigator.sendBeacon`.

Built-in event names are exported for convenience:

```ts
import { KRAK_LITE_EVENTS } from '@karibsen/krak-lite-nuxt'
// page_view, click, outbound_click, form_submit,
// cta_click, language_changed, search, share
```

### Declarative click tracking

With `autoCapture` enabled (default), any click on an element carrying
`data-krak-event` is tracked — no JavaScript required:

```html
<button
  data-krak-event="cta_click"
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
like one. Sensitive keys (`email`, `phone`, `name`, `address`, `userId`, …)
are ignored.

## Receiving events

Events are POSTed to your `endpoint` as a single JSON batch:

```jsonc
{
  "v": 1,
  "s": "my-app",
  "ev": [
    {
      "e": "page_view",      // event name
      "t": 1718136000000,    // timestamp (ms)
      "p": "/pricing",       // path (query string stripped)
      "s": "my-app",         // source
      "sid": "…",            // in-memory anonymous session id
      "data": { }            // optional payload
    }
  ]
}
```

A minimal Nitro handler:

```ts
// server/api/analytics/events.post.ts
export default defineEventHandler(async (event) => {
  const batch = await readBody(event)
  // persist batch.ev …
  return null
})
```

## Roadmap

- Support per-page tracking options via `definePageMeta`, allowing automatic page views to be enabled or disabled on specific routes.

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
