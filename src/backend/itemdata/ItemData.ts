import { Console } from "console"
import { serealizeBase64NBT } from "../../utils/DataUtils"
import { onCooldown } from "../../utils/MathUtils"
import { prisma } from "../backend"
import { getAuctionData, saveAuctionData } from "./AuctionData"
import { getBazaarData, saveBazaarData } from "./BazaarData"



async function requestSkyblockItemsEndpoint() {
  const url = `https://api.hypixel.net/v2/resources/skyblock/items`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}


export async function getSkyblockItemData(): Promise<{ success: boolean; data: string }> {
  const data: {  
    skyblockItems: {
      id: string,
      name: string,
      rarity: string,
      npcSellPrice: number,
      bazaarBuyPrice: number,
      bazaarSellPrice: number,
      averageBazaarBuy: number,
      averageBazaarSell: number,
      lowestBin: number,
      averageLowestBin: number
    }[]
  } = {
    skyblockItems: []
  }

  const hypixelItems = await prisma.itemData.findMany({})
  
  console.log(hypixelItems.length)

  const promises: Promise<void>[] = []
  for (let i = 0; i < hypixelItems.length; i++) {

    promises.push(new Promise<void>((resolve, reject) => {
      const item = hypixelItems[i]
      const itemId = item.itemId
      const rarity = item.rarity
      const name = item.name
      const npcSellPrice = item.npcSellPrice

      data.skyblockItems.push({
        id: itemId,
        name: name,
        rarity: rarity,
        npcSellPrice: npcSellPrice,
        bazaarBuyPrice: item.bazaarBuyPrice,
        bazaarSellPrice: item.bazaarSellPrice,
        averageBazaarBuy: item.averageBazaarBuy,
        averageBazaarSell: item.averageBazaarSell,
        lowestBin: item.lowestBin,
        averageLowestBin: item.averageLowestBin
      })
      resolve()
    }))
  }

  await Promise.all(promises)
  return {success: true, data: JSON.stringify(data)}
}


export async function saveItemData() {
  requestSkyblockItemsEndpoint().then((response) => {
    const object = JSON.parse(response)

    if (object?.success != true) {
      return
    }

    const items: any[] = object?.items ?? []

    const promises: Promise<any>[] = []
    items.forEach((item) => {
      prisma.itemData.findFirst({
        where:{ 
          itemId: item.id
        }
      }).then((found) => {
        if (found == null) {

          promises.push(new Promise<void>((resolve, reject) => {
            prisma.itemData.create({
            data: {
              itemId: item?.id ?? "",
              rarity: item?.tier ?? "",
              name: item?.name ?? "",
              npcSellPrice: item?.npc_sell_price ?? 0
            }
            }).then((test) => {
              resolve()
            })
          }))
        }
      })
    })

    Promise.all(promises).then(() => {
      console.log("Finished saving item data")
      prisma.$disconnect()
      // saveBazaarData()
      saveAuctionData()
      
    })
  })
}