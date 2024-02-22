import { CACHE_TIME_MINUTES, prisma } from "./backend";


// Deletes any data that has been saved for over 10 minutes
export function cleanCache() {
  prisma.skyblockPlayer.deleteMany({
    where: {
      updateTime: {
        lte: (Date.now() - (CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  }).then(() => {
    console.log("Cleaning Caches")
    prisma.$disconnect()
  }).catch((error) => {
    console.error(error)
  })
}