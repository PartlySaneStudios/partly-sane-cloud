//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { onCooldown } from "../../utils/MathUtils";
import { serializeBase64NBT } from "../../utils/SystemUtils";
import { prisma } from "../backend";

async function requestSkyblockAuctionsEndpoint(page: number) {
  const url = `https://api.hypixel.net/v2/skyblock/auctions?page=${page}`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch (exception) {
    console.error(exception)
    return "{}"
  }
}

export async function loadAuctionHouseData() {
  try {
    console.log("Loading auction data")
    const firstPageResponse = await JSON.parse(await requestSkyblockAuctionsEndpoint(0))
    if (firstPageResponse.success != true) {
      return
    }
    const totalPages = Number(firstPageResponse?.totalPages ?? 0)
    const totalAuctions = Number(firstPageResponse?.totalAuctions ?? 1)

    let lastRequestTime = Date.now()
    let auctionCount = 0
    const auctionHistoriesPromises: Promise<any>[] = []
    for (let i = 0; i < totalPages; i++) {
      if (onCooldown(lastRequestTime, 500)) {
        await new Promise(f => setTimeout(f, Math.abs(Date.now() - (lastRequestTime + 500))));
      }
      lastRequestTime = Date.now()

      auctionHistoriesPromises.push(new Promise<void>((resolve, reject) => {
        requestSkyblockAuctionsEndpoint(i).then((endpoints) => {
          const skyblockItemResponse = JSON.parse(endpoints)
          if (skyblockItemResponse?.success != true || skyblockItemResponse?.auctions == null) {
            console.error("Error getting auction data")
            return
          }
          const auctionEntries: any[] = skyblockItemResponse.auctions

          const auctionDataToCreate: {
            skipDuplicates: boolean,
            data: {
              itemId: string
              lowestBin: number,
              averageLowestBin: number
            }[]
          } = {
            skipDuplicates: true,
            data: []
          }

          const auctionHistoriesToCreate: {
            skipDuplicates: boolean
            data: {
              auctionUUID: string
              playerUUID: string
              start: bigint,
              end: bigint,
              itemName: string,
              itemBytes: string,
              itemId: string
              bin: boolean,
              startingBid: bigint
              highestBid: bigint
            }[]
          } = {
            skipDuplicates: true,
            data: []
          }

          const loopPromises: Promise<void>[] = []
          for (let i = 0; i < auctionEntries.length; i++) {
            const entry = auctionEntries[i]
            loopPromises.push(new Promise<void>((resolve, reject) => {
              // console.log(`Auction: ${auctionCount}/${totalAuctions} (${Math.round(auctionCount/totalAuctions * 1000)/10.0}%)`)
              auctionCount++

              const nbtTag = serializeBase64NBT(entry?.item_bytes ?? "")
              const itemId = nbtTag?.i[0]?.tag?.ExtraAttributes?.id ?? ""

              auctionHistoriesToCreate.data.push({
                auctionUUID: entry?.uuid ?? "",
                playerUUID: entry?.auctioneer ?? "",
                start: entry?.start ?? 0,
                end: entry?.end ?? 0,
                itemName: entry?.item_name ?? "",
                itemBytes: entry?.item_bytes ?? "",
                itemId: itemId,
                bin: entry?.bin ?? false,
                startingBid: entry?.starting_bid ?? 0,
                highestBid: entry?.highest_bid_amount ?? 0
              })
              auctionDataToCreate.data.push({
                itemId: itemId,
                averageLowestBin: 0,
                lowestBin: 0
              })

              resolve()
            }))
          };
          Promise.all(loopPromises).then(() => {
            prisma.itemAuctionData.createMany(auctionDataToCreate).then(() => {
              prisma.$disconnect()
              prisma.$connect().then(() => {
                prisma.itemAuctionHistory.createMany(auctionHistoriesToCreate).then(() => {
                  resolve()
                }).catch((error) => {
                  console.error(error)
                })
              })
            }).catch((error) => {
              console.error(error)
            })
          }).catch((error) => {
            console.error(error)
          })
        }).catch((error) => {
          console.error(error)
        })
      }).catch((error) => {
        console.error(error)
      })
      )
    }

    Promise.all(auctionHistoriesPromises).then(() => {
      console.log("Finished caching auction data")
      prisma.$disconnect()
      prisma.$connect().then(() => {
        prisma.itemData.findMany({ // finds all of the items that have active auctions 
          where: {
            // TODO: Safely Rename this to auctionData
            aucitonData: {
              auctionHistory: {
                some: {
                  AND: {
                    numId: {
                      gte: -1
                    },
                    end: {
                      gte: Date.now()
                    },
                    bin: true
                  }

                }
              }
            }
          },

          select: {
            itemId: true,
            aucitonData: {
              select: {
                auctionHistory: true,
                lowestBinHistory: {
                  where: {
                    time: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                  }
                }
              }
            }
          },
        }).then((items) => {
          const currentAuctionHouseToCreate: {
            skipDuplicates: boolean
            data: {
              itemId: string
              lowestBin: number
              averageLowestBin: number
            }[]
          } = {
            data: [],
            skipDuplicates: true
          }

          const currentAuctionHouseToUpdate: {
            where: {
              itemId: string
            }
            data: {
              lowestBin: number
              averageLowestBin: number
            }
          }[] = []

          const lowestBinHistoryToCreate: {
            skipDuplicates: boolean
            data: {
              itemId: string
              price: number
            }[]
          } = {
            data: [],
            skipDuplicates: true
          }

          for (let i = 0; i < items.length; i++) { // For each of the items
            const item = items[i]
            let lowestBin = Number.MAX_VALUE 
            for (let k = 0; k < (item.aucitonData?.auctionHistory?.length ?? 0); k++) {
              let history = item.aucitonData?.auctionHistory[k]
              // console.log(`ItemId: ${item.itemId}, Price: ${history?.startingBid ?? 0}, Lowest Bin: ${lowestBin} IsLowestBin: ${(history?.startingBid ?? Number.MAX_VALUE) < lowestBin},`)
              if ((history?.startingBid ?? Number.MAX_VALUE) < lowestBin) {
                lowestBin = Number(history!!.startingBid)
              }
            }

            lowestBinHistoryToCreate.data.push({
              itemId: item.itemId,
              price: lowestBin
            })

            // Finds the trapezoidal Riemann sum to find an estimate of the integral
            const itemHistory = item.aucitonData?.lowestBinHistory ?? []
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

            for (let i = 1; i < itemHistory.length - 1; i++) {
              if (itemHistory[i]?.time?.getTime() ?? Number.MAX_VALUE < firstTime) {
                firstTime = itemHistory[i].time.getTime()
              }
              if (itemHistory[i]?.time?.getTime() ?? Number.MIN_VALUE > lastTime) {
                lastTime = itemHistory[i]?.time?.getTime()
              }

              const buyLeftSide = itemHistory[i - 1]?.price ?? 0
              const buyRightSide = itemHistory[i]?.price ?? 0
              const height = (itemHistory[i]?.time?.getTime() ?? 0) - previousTime

              buySum += .5 * Number(buyLeftSide + buyRightSide) * Number(height)
            }


            // Finds the average derivative (rate of change) of the riemann sum
            let deltaTime = lastTime - firstTime
            let averageBuy = -1
            if (deltaTime == 0) {
              averageBuy = Number(itemHistory[0]?.price ?? 0)
            } else {
              averageBuy = buySum / deltaTime
            }

            currentAuctionHouseToUpdate.push({
              where: {
                itemId: item.itemId
              },
              data: {
                lowestBin: lowestBin,
                averageLowestBin: averageBuy
              }
            })
          };

          const updatePromises: Promise<void>[] = []

          prisma.$connect().then(() => {
            for (let i = 0; i < currentAuctionHouseToUpdate.length; i++) {
              const element = currentAuctionHouseToUpdate[i]

              updatePromises.push(new Promise<void>((resolve, reject) => {
                prisma.itemAuctionData.update(element).then(() => {
                  resolve()
                }).catch((reason) => {
                  reject(reason)
                })
              }))
            };
          }).then(() => {
            prisma.itemAuctionData.createMany(currentAuctionHouseToCreate).then(() => {
              Promise.all(updatePromises).then(() => {
                prisma.$disconnect()
              }).then(() => {
                prisma.$connect().then(() => {
                  prisma.itemLowestBinHistory.createMany(lowestBinHistoryToCreate).then(() => {
                    console.log("Finished updating historical auction data")
                    prisma.$disconnect()
                  })
                })

              })
            })
          })

        }).catch((error) => {
          console.error(error)
        })
      })
    }).catch((error) => {
      console.error(error)
    })
  }
  catch (error) {
    console.error(error)
  }
}