import { prisma } from "../backend"


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


export async function loadItemData() {
  const requestPromises: Promise<string>[] = [
    requestSkyblockItemsEndpoint()
  ]

  Promise.all(requestPromises)
  .then((endpoints) => {
    const skyblockItemResponse = JSON.parse(endpoints[0])
    if (skyblockItemResponse?.success != true || skyblockItemResponse?.items == null) {
      console.error("Error getting skyblock items")
      return
    }

    const skyblockItems: any[] = skyblockItemResponse?.items

    const storedItemIds = prisma.itemData.findMany({
      select: {
        itemId: true
      }
    })
    .then((items) => {
      prisma.$disconnect()
      const itemIds = items.map(obj => obj.itemId)
      const itemsToCreate: {data: {
        itemId: string
        rarity: string
        name: string
        npcSellPrice: number
      }[]
      } = {
        data: []
      }
      const itemsToUpdate: {
        where: {
          itemId: string
        }
        data: {
          npcSellPrice: number
        }
      }[] = []
      skyblockItems.forEach(item => {
        if (!itemIds.includes(item.id)) {
          itemsToCreate.data.push({
            itemId: item.id,
            rarity: item.tier,
            name: item.name,
            npcSellPrice: item.npc_sell_price
          })
        } else {
          itemsToUpdate.push({
            where: {
              itemId: item.id
            },
            data: {
              npcSellPrice: item.npc_sell_price
            }
          })
        }
      });
      const updatePromises: Promise<void>[] = []

      itemsToUpdate.forEach(element => {
        updatePromises.push(new Promise<void>((resolve, reject) => {
          prisma.itemData.update(element).then(() => {
            resolve()
          }).catch((reason) => {
            reject(reason)
          })
        }))
      });
    
      prisma.itemData.createMany(itemsToCreate).then(() => {
        Promise.all(updatePromises).then(() => {
          prisma.$disconnect
        })
      })
    




    })

    
    
  })
}