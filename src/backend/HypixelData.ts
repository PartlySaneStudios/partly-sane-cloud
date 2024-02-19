

// https://api.hypixel.net/v2/skyblock/profiles

import { env } from "node:process"

async function requestSkyblockProfilesEndpoint(uuid: string): Promise<string> {

  const url = `https://api.hypixel.net/v2/skyblock/profiles?key=${env.HYPIXEL_API_KEY}&uuid=${uuid}`
  try {
    const response = await (await fetch(url)).json()
    return response
  } catch(exception) {
    console.error(exception)
  }
  return ""
}
