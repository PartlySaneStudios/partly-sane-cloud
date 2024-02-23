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
        time: {
          lte: new Date(Date.now() - (AUCTION_CACHE_TIME_MINUTES * 60 * 1000))
        }
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
        prisma.$disconnect()
      })
    })
  }).catch((error) => {
    console.error(error)
  })
}