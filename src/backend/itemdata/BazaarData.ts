import { time } from "console"
import { prisma } from "../backend"


async function requestSkyblockBazaarEndpoint() {
  const url = `https://api.hypixel.net/v2/skyblock/bazaar`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}

export async function loadBazaarData() {
  const requestPromises: Promise<string>[] = [
    requestSkyblockBazaarEndpoint()
  ]

  Promise.all(requestPromises)
  .then((endpoints) => {
    const skyblockItemResponse = JSON.parse(endpoints[0])
    if (skyblockItemResponse?.success != true || skyblockItemResponse?.products == null) {
      console.error("Error getting skyblock items")
      return
    }

    const bazaarEntries: any = skyblockItemResponse?.products
    prisma.itemData.findMany({
      select: {
        itemId: true
      }
    })
    .then((items) => {
      prisma.$disconnect()
      const itemIds = items.map(item => item.itemId)
      
      prisma.itemBazaarData.findMany({
        select: {
          itemId: true,
          history: {
            where: {
              time: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000 )
              }
            }
          }
        }
      }).then((cachedItems => {
        const cachedItemIds = cachedItems.map(it => it.itemId)
        const cachedItemHistories = cachedItems.map(it => it.history)

        const itemsToCreate: {
          skipDuplicates: boolean
          data: {
            itemId: string
            buyPrice: number
            sellPrice: number
            averageBuyPrice: number
            averageSellPrice: number
          }[]
        } = {
          data: [],
          skipDuplicates: true
        }

        const itemsToUpdate: {
          where: {
            itemId: string
          }
          data: {
            buyPrice: number
            sellPrice: number
            averageBuyPrice: number
            averageSellPrice: number
          }
        }[] = []
        Object.keys(bazaarEntries).forEach((key, index) => {
          const entry = bazaarEntries[key]
          const sellSummary: any[] = entry.sell_summary
          let lowestSellPrice = sellSummary[0]?.pricePerUnit ?? 0
          sellSummary.forEach((value) => {
            if (value.pricePerUnit < lowestSellPrice) {
              lowestSellPrice = value.pricePerUnit
            }
          })
          const buySummary: any[] = entry.buy_summary

          let highestBuyPrice = buySummary[0]?.pricePerUnit ?? 0
          buySummary.forEach((value) => {
            if (value.pricePerUnit > highestBuyPrice) {
              highestBuyPrice = value.pricePerUnit
            }
          })

          const itemHistory = cachedItemHistories[index] ?? []

          // Finds the trapazoidal Riemann sum to find an estimate of the integral
          let previousTime = itemHistory[0]?.time?.getTime() ?? 0
          let buySum = 0
          let sellSum = 0

          for (let i = 1; i < cachedItemHistories.length - 1; i++) {
            const buyLeftSide = itemHistory[i - 1].buyPrice
            const buyRightSide = itemHistory[i].buyPrice
            const sellLeftSide = itemHistory[i - 1].sellPrice
            const sellRightSide = itemHistory[i].sellPrice
            const height = itemHistory[i].time.getTime() - previousTime

            buySum += .5 * (buyLeftSide + buyRightSide) * Number(height)
            sellSum += .5 * (sellLeftSide + sellRightSide) * Number(height)
          }


          // Finds the average derivative (rate of change) of the riemann sum
          let firstTime = itemHistory[0]?.time.getTime() ?? 0
          let lastTime = itemHistory[itemHistory.length - 1]?.time.getTime() ?? 0
          let deltaTime = firstTime - lastTime
          let averageBuy = -1
          let averageSell = -1
          if (deltaTime == 0) {
            averageBuy = itemHistory[0]?.buyPrice ?? 0
            averageSell = itemHistory[0]?.sellPrice ?? 0
          } else {
            averageBuy = buySum / deltaTime
            averageSell = sellSum / deltaTime
          }


          if (cachedItemIds.includes(key)) {
            itemsToUpdate.push({
              where: {
                itemId: key
              },
              data: {
                buyPrice: highestBuyPrice,
                sellPrice: lowestSellPrice,
                averageBuyPrice: averageBuy,
                averageSellPrice: averageSell
              }
            })
          } else {
            itemsToCreate.data.push({
              itemId: key,
              buyPrice: highestBuyPrice,
              sellPrice: lowestSellPrice,
              averageBuyPrice: averageBuy,
              averageSellPrice: averageSell
            })
          }
        })

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


        prisma.itemBazaarData.createMany(itemsToCreate).then(() => {
          Promise.all(updatePromises).then(() => {
            prisma.$disconnect()
          })
        })
      }))
    })
  })
}