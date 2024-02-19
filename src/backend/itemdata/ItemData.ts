import { serealizeBase64NBT } from "../../utils/DataUtils"
import { onCooldown } from "../../utils/MathUtils"
import { prisma } from "../backend"
import { getAuctionData } from "./AuctionData"
import { getBazaarData } from "./BazaarData"



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
    rawBazaar: any
    rawItem: any
  
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
    rawBazaar: {},
    rawItem: {},
    skyblockItems: []
  }

  const hypixelItems = await prisma.itemData.findMany({})
  console.log(hypixelItems.length)

  const promises: Promise<void>[] = []

  

  for (let i = 0; i < hypixelItems.length; i++) {

    promises.push(new Promise<void>((resolve, reject) => {
      const itemId = hypixelItems[i].itemId
      const rarity = hypixelItems[i].rarity
      const name = hypixelItems[i].name
      const npcSellPrice = hypixelItems[i].npcSellPrice

      const pricePromises: Promise<any>[] = []

      pricePromises.push(new Promise<any>((resolve, reject) => {return getBazaarData(itemId)}))
      pricePromises.push(new Promise<any>((resolve, reject) => {return getAuctionData(itemId)}))

      Promise.all(pricePromises).then((prices) => {
        const bazaarData = prices[0]
        const auctionData = prices[1]

        data.skyblockItems.push({
          id: itemId,
          name: name,
          rarity: rarity,
          npcSellPrice: npcSellPrice,
          bazaarBuyPrice: bazaarData.buyPrice,
          bazaarSellPrice: bazaarData.sellPrice,
          averageBazaarBuy: bazaarData.averageBuy,
          averageBazaarSell: bazaarData.averageSell,
          lowestBin: auctionData.lowestBin,
          averageLowestBin: auctionData.averageLowestBin
        })
      })
      console.log(i)
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

    items.forEach((item) => {
      prisma.itemData.findFirst({
        where:{ 
          itemId: item.id
        }
      }).then((found) => {
        prisma.$disconnect()
        if (found == null) {
          prisma.itemData.create({
            data: {
              itemId: item?.id ?? "",
              rarity: item?.tier ?? "",
              name: item?.name ?? "",
              npcSellPrice: item?.npc_sell_price ?? 0
            }
          }).then(() => {
            prisma.$disconnect()
          })
        }
      })
    })
  })
}