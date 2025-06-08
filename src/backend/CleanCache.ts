//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { AUCTION_CACHE_TIME_MINUTES, ITEM_DATA_HISTORY_CACHE_TIME_MINUTES, PLAYER_CACHE_TIME_MINUTES, prisma, UUID_CACHE_TIME_MINUTES } from "./backend";


// Deletes any data that has been saved for over 10 minutes
export async function cleanCache() {
  console.log("Cleaning caches")
  await prisma.skyblockPlayer.deleteMany({
    where: {
      updateTime: {
        lte: (Date.now() - (PLAYER_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  }).then(v => console.log(`Cleaned ${v.count} old skyblock player caches`))

  await prisma.itemAuctionHistory.deleteMany({
    where: {
      OR: [
        {
          time: {
            lte: new Date(Date.now() - (AUCTION_CACHE_TIME_MINUTES * 60 * 1000))
          },
        },
        {
          end: {
            lte: Date.now()
          }
        }
      ]
    }
  }).then(v => console.log(`Cleaned ${v.count} old auctions caches`))

  await prisma.itemLowestBinHistory.deleteMany({
    where: {
      time: {
        lte: new Date(Date.now() - (ITEM_DATA_HISTORY_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  }).then(v => console.log(`Cleaned ${v.count} old lowest bins`))

  await prisma.itemBazaarHistory.deleteMany({
    where: {
      time: {
        lte: new Date(Date.now() - (AUCTION_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  }).then(v => console.log(`Cleaned ${v.count} old bazaar caches`))
  console.log("Cleaned bazaar caches")

  await prisma.bazaarItemPrice.deleteMany({
    where: {
      time: {
        lte: Date.now() - (ITEM_DATA_HISTORY_CACHE_TIME_MINUTES * 60 * 1000)
      }
    }
  }).then(v => console.log(`Cleaned ${v.count} old bazaar data`))

  const v = await prisma.uUID.deleteMany({
    where: {
      lastTimeUpdate: {
        lt: new Date(Date.now() - UUID_CACHE_TIME_MINUTES * 60 * 1000)
      }
    }
  }).then(v => console.log(`Cleaned ${v.count} old uuid data`))

  await prisma.$disconnect()
}
