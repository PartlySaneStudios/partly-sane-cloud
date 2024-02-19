

// https://api.hypixel.net/v2/skyblock/profiles

import { env } from "process"
import { prisma } from "./backend"


async function requestSkyblockProfilesEndpoint(uuid: string): Promise<string> {
  const url = `https://api.hypixel.net/v2/skyblock/profiles?key=${env.HYPIXEL_API_KEY}&uuid=${uuid}`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}

async function requestHypixelPlayerEndpoint(uuid: string): Promise<string> {
  const url = `https://api.hypixel.net/v2/player?key=${env.HYPIXEL_API_KEY}&uuid=${uuid}`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}

export async function getSkyblockPlayerData(uuid: string): Promise<{ success: boolean; data: string }> {
  const data: {
    rawProfiles: any
    rawPlayer: any

    skyblockPlayer: {
      currentProfileId: string
      profiles: {
        profileId: string
        selected: boolean
        skyblockExperience: number
        catacombsExperience: number
        combatExperience: number
        miningExperience: number
        foragingExperience: number
        farmingExperience: number
        enchantingExperience: number
        fishingExperience: number
        alchemyExperience: number
        tamingExperience: number
  
        armorData: string
        quiverData: string
        petName: string
        selectedDungeonClass: string
        normalRuns: number[]
        masterModeRuns: number[]
  
        totalRuns: number
  
        secretsCount: number
        baseHealth: number
        baseDefense: number
        baseIntelligence: number
        baseEffectiveHealth: number
      }[]
    }
  } = {
    rawProfiles: {},
    rawPlayer: {},
    skyblockPlayer: {
      currentProfileId: "",
      profiles: []
    }
  }

  const response = await JSON.parse(await requestSkyblockProfilesEndpoint(uuid))
  if (response.success != true) {
    return {
      success: false,
      data: response
    }
  }

  const playerResponse = await JSON.parse(await requestHypixelPlayerEndpoint(uuid)) 
  if (response.success != true) {
    return {
      success: false,
      data: response
    }
  }

  if (playerResponse.success != true) {
    return {
      success: false,
      data: response
    }
  }

  const profiles = response.profiles

  data.rawProfiles = profiles
  data.rawPlayer = playerResponse.player

  for (let i = 0; profiles[i] != null; i++) {
    const currentProfile = profiles[i]
    const profileId = currentProfile?.profile_id
    const playerProfile = currentProfile?.members[uuid.replace(/-/g, "")]
    const selected = currentProfile?.selected == true

    if (selected) {
      data.skyblockPlayer.currentProfileId = profileId
    }
    const skyblockExperience = playerProfile?.leveling?.experience ?? 0
    const catacombsExpereince = playerProfile?.dungeons?.dungeon_types?.catacombs?.experience ?? 0
    const combatExperience = playerProfile?.player_data?.experience?.SKILL_COMBAT ?? 0
    const miningExperience = playerProfile?.player_data?.experience?.SKILL_MINING ?? 0
    const foragingExperience = playerProfile?.player_data?.experience?.SKILL_FORAGING ?? 0
    const farmingExperience = playerProfile?.player_data?.experience?.SKILL_FARMING ?? 0
    const enchantingExperience = playerProfile?.player_data?.experience?.SKILL_ENCHANTING ?? 0
    const fishingExperience = playerProfile?.player_data?.experience?.SKILL_FISHING ?? 0
    const alchemyExperience = playerProfile?.player_data?.experience?.SKILL_ALCHEMY ?? 0
    const tamingExperience = playerProfile?.player_data?.experience?.SKILL_TAMING ?? 0
    
    const armorData = playerProfile?.inventory?.inv_armor?.data ?? "" // TODO: convert this base 64 nbt string and add an "armorName" field
    const quiverData = playerProfile?.inventory?.bag_contents?.quiver?.data ?? ""

    let selectedPetName = ""
    if (playerProfile?.pets_data?.pets != null) {
      const pets = playerProfile?.pets_data?.pets
      for (let i = 0; pets[i] != null ; i++) {
        const pet = pets[i]
        if (pet?.active != true) {
          continue
        }
        selectedPetName = ((pet?.tier ?? "") + " " + (pet?.type ?? "").replace(/\"/g, "").replace(/_/g, " ")) ?? ""
      }
    }

    const selectedDungeonClass = playerProfile?.dungeons?.selected_dungeon_class ?? ""

    let totalRuns = 0
    const masterModeRuns: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
    const normalRuns: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < masterModeRuns.length; i++) {
      const completions = playerProfile?.dungeons?.dungeon_types?.master_catacombs?.tier_completions
      if (completions != null && completions[i] != null) {
        masterModeRuns[i] = completions[i]
      }
    

      totalRuns += masterModeRuns[i];
    }

    for (let i = 0; i < normalRuns.length; i++) {
      const completions = playerProfile?.dungeons?.dungeon_types?.catacombs?.tier_completions
      if (completions != null && completions[i] != null) {
        normalRuns[i] = completions[i]
      }
    
      totalRuns += normalRuns[i];
    }

    const secretsCount = playerResponse?.player?.achievements?.skyblock_treasure_hunter ?? 0
    

    data.skyblockPlayer.profiles.push({
      profileId: profileId,
      selected: selected,
      skyblockExperience: skyblockExperience,
      catacombsExperience: catacombsExpereince,
      combatExperience: combatExperience,
      miningExperience: miningExperience,
      foragingExperience: foragingExperience,
      farmingExperience: farmingExperience,
      enchantingExperience: enchantingExperience,
      fishingExperience: fishingExperience,
      alchemyExperience: alchemyExperience,
      tamingExperience: tamingExperience,

      armorData: armorData,
      quiverData: quiverData,
      petName: selectedPetName,
      selectedDungeonClass: selectedDungeonClass,
      normalRuns: normalRuns,
      masterModeRuns: masterModeRuns,

      totalRuns: totalRuns,

      secretsCount: secretsCount,
      baseHealth: 100,
      baseDefense: 0,
      baseIntelligence: 100,
      baseEffectiveHealth: 100,
    })
    profiles[i]
  }

  return {
    success: true,
    data: JSON.stringify(data)
  }
}

// Convert NBT to JSON
function nbtToJson(nbtData: any): any {
  return JSON.stringify(nbtData, null, 2);
}
