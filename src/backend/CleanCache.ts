//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { AUCTION_CACHE_TIME_MINUTES, ITEM_DATA_HISTORY_CACHE_TIME_MINUTES, PLAYER_CACHE_TIME_MINUTES, prisma } from "./backend";


// Deletes any data that has been saved for over 10 minutes
export async function cleanCache() {
  console.log("Cleaning caches")
  await prisma.skyblockPlayer.deleteMany({
    where: {
      updateTime: {
        lte: (Date.now() - (PLAYER_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  })    
  console.log("Cleaned skyblock player caches")

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
  })
  console.log("Cleaned auction caches")

  await prisma.itemLowestBinHistory.deleteMany({
    where: {
      time: {
        lte: new Date(Date.now() - (ITEM_DATA_HISTORY_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  })
  console.log("Cleaned old lowest bins")

  await prisma.itemBazaarHistory.deleteMany({
    where: {
      time: {
        lte: new Date(Date.now() - (AUCTION_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  })
  console.log("Cleaned bazaar caches")

  await prisma.bazaarItemPrice.deleteMany({
    where: {
      time: {
        lte: Date.now() - (ITEM_DATA_HISTORY_CACHE_TIME_MINUTES * 60 * 1000)
      }
    }
  })
  console.log("Cleaned old bazaar data")

  
  await prisma.$disconnect()

}
