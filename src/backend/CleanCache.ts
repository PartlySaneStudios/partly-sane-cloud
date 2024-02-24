//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { AUCTION_CACHE_TIME_MINUTES, PLAYER_CACHE_TIME_MINUTES, prisma } from "./backend";


// Deletes any data that has been saved for over 10 minutes
export function cleanCache() {
  console.log("Cleaning caches")
  prisma.skyblockPlayer.deleteMany({
    where: {
      updateTime: {
        lte: (Date.now() - (PLAYER_CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  }).then(() => {
    console.log("Cleaned skyblock player caches")
    prisma.itemAuctionHistory.deleteMany({
      
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
    }).then(() => {
      console.log("Cleaned auction caches")
      prisma.itemBazaarHistory.deleteMany({
        where: {
          time: {
            lte: new Date(Date.now() - (AUCTION_CACHE_TIME_MINUTES * 60 * 1000))
          }
        }
      }).then(() => {
        console.log("Cleaned bazaar caches")
      }).then(() => {
        prisma.$disconnect()
      })
    })
  }).catch((error) => {
    console.error(error)
  })
}