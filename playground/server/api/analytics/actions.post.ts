import type { KrakLiteQueuedAction } from '@karibsen/krak-lite-nuxt'

export default defineEventHandler(async (event) => {
  const body: KrakLiteQueuedAction[] = await readBody(event)

  console.log(body)
})
