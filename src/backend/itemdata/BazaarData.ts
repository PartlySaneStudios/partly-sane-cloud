//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { prisma } from "../backend"


async function requestSkyblockBazaarEndpoint() {
  const url = `https://api.hypixel.net/v2/skyblock/bazaar`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch (exception) {
    console.error(exception)
    return "{}"
  }
}

export async function loadBazaarData() {
  try {

    console.log("Loading bazaar data")
    const requestPromises: Promise<string>[] = [
      requestSkyblockBazaarEndpoint()
    ]

    Promise.all(requestPromises)
      .then((endpoints) => {
        const skyblockItemResponse = JSON.parse(endpoints[0])
        if (skyblockItemResponse?.success != true || skyblockItemResponse?.products == null) {
          console.error("Error getting bazaar data")
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

            prisma.$connect().then(() => {
              prisma.itemBazaarData.findMany({
                select: {
                  itemId: true,
                  history: {
                    where: {
                      time: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                      }
                    }
                  }
                }
              }).then((cachedItems => {
                const cachedItemIds = cachedItems.map(it => it.itemId)
                const cachedItemHistories = cachedItems.map(it => it.history)

                const currentBazaarToCreate: {
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

                const currentBazaarToUpdate: {
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

                const bazaarHistoryToCreate: {
                  skipDuplicates: boolean
                  data: {
                    itemId: string,
                    buyPrice: number,
                    sellPrice: number,
                  }[]
                } = {
                  skipDuplicates: true,
                  data: []
                }

                for (let i = 0; i < Object.keys(bazaarEntries).length; i++) {
                  const key = Object.keys(bazaarEntries)[i]
                  const entry = bazaarEntries[key]
                  const sellSummary: any[] = entry.sell_summary
                  let lowestSellPrice = sellSummary[0]?.pricePerUnit ?? 0
                  for (let k = 0; k < sellSummary.length; k++) {
                    const value = sellSummary[k]
                    if (value.pricePerUnit < lowestSellPrice) {
                      lowestSellPrice = value.pricePerUnit
                    }
                  }
                  const buySummary: any[] = entry.buy_summary

                  let highestBuyPrice = buySummary[0]?.pricePerUnit ?? 0
                  for (let k = 0; k < buySummary.length; k++) {
                    const value = buySummary[k]
                    if (value.pricePerUnit > highestBuyPrice) {
                      highestBuyPrice = value.pricePerUnit
                    }
                  }

                  const itemHistory = cachedItemHistories[cachedItemIds.indexOf(key)] ?? []

                  // Finds the trapezoidal Riemann sum to find an estimate of the integral
                  let previousTime = itemHistory[0]?.time?.getTime() ?? 0
                  let firstTime = 0
                  let lastTime = 0
                  if (previousTime == 0) {
                    firstTime = Number.MAX_VALUE
                    lastTime = Number.MIN_VALUE
                  } else {
                    firstTime = previousTime
                    lastTime = previousTime
                  }
                  let buySum = 0
                  let sellSum = 0

                  for (let i = 1; i < cachedItemHistories.length - 1; i++) {
                    if (itemHistory[i]?.time?.getTime() ?? Number.MAX_VALUE < firstTime) {
                      firstTime = itemHistory[i].time.getTime()
                    }
                    if (itemHistory[i]?.time?.getTime() ?? Number.MIN_VALUE > lastTime) {
                      lastTime = itemHistory[i]?.time?.getTime()
                    }

                    const buyLeftSide = itemHistory[i - 1]?.buyPrice ?? 0
                    const buyRightSide = itemHistory[i]?.buyPrice ?? 0
                    const sellLeftSide = itemHistory[i - 1]?.sellPrice ?? 0
                    const sellRightSide = itemHistory[i]?.sellPrice ?? 0
                    const height = (itemHistory[i]?.time?.getTime() ?? 0) - previousTime

                    buySum += .5 * (buyLeftSide + buyRightSide) * Number(height)
                    sellSum += .5 * (sellLeftSide + sellRightSide) * Number(height)
                  }


                  // Finds the average derivative (rate of change) of the riemann sum
                  let deltaTime = lastTime - firstTime
                  let averageBuy = -1
                  let averageSell = -1
                  if (deltaTime == 0) {
                    averageBuy = itemHistory[0]?.buyPrice ?? 0
                    averageSell = itemHistory[0]?.sellPrice ?? 0
                  } else {
                    averageBuy = buySum / deltaTime
                    averageSell = sellSum / deltaTime
                  }

                  bazaarHistoryToCreate.data.push({
                    itemId: key,
                    buyPrice: highestBuyPrice,
                    sellPrice: lowestSellPrice,
                  })

                  if (cachedItemIds.includes(key)) {
                    currentBazaarToUpdate.push({
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
                    currentBazaarToCreate.data.push({
                      itemId: key,
                      buyPrice: highestBuyPrice,
                      sellPrice: lowestSellPrice,
                      averageBuyPrice: averageBuy,
                      averageSellPrice: averageSell
                    })
                  }
                }

                const updatePromises: Promise<void>[] = []

                prisma.$connect().then(() => {
                  for (let i = 0; i < currentBazaarToUpdate.length; i++) {
                    const element = currentBazaarToUpdate[i]
                    updatePromises.push(new Promise<void>((resolve, reject) => {
                      prisma.itemBazaarData.update(element).then(() => {
                        resolve()
                      }).catch((reason) => {
                        reject(reason)
                      })
                    }))
                  };
                }).then(() => {
                  prisma.itemBazaarData.createMany(currentBazaarToCreate).then(() => {
                    Promise.all(updatePromises).then(() => {
                      prisma.$disconnect()
                    }).then(() => {
                      prisma.$connect().then(() => {
                        prisma.itemBazaarHistory.createMany(bazaarHistoryToCreate).then(() => {
                          prisma.$disconnect()
                        })
                      })

                    })
                  })
                })




              })).catch((error) => {
                console.error(error)
              })
            })

          }).catch((error) => {
            console.error(error)
          })
      }).catch((error) => {
        console.error(error)
      })
  } catch (error) {
    console.error(error)
  }
}