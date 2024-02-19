import { prisma } from "./backend";

const CACHE_TIME_MINUTES = 10

// Deletes any data that has been saved for over 10 minutes
export function cleanCache() {
  prisma.user.deleteMany({
    where: {
      updateTime: {
        lte: (Date.now() - (CACHE_TIME_MINUTES * 60 * 1000))
      }
    }
  })
}