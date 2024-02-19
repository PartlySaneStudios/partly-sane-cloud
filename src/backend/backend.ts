import { PrismaClient } from '@prisma/client'
import { cleanCache } from './CleanCache';
import { saveBazaarData, updateAuctionCache } from './ItemData';

export const prisma = new PrismaClient()

const CLEAN_CACHE_MINUTES = 1
const BAZAAR_SAVE_MINUTES = 5
const AUCTION_CACHE_MINUTES = 10

export function loadBackend() {
  // cleanCache()
  const cleanCacheInterval = setInterval(cleanCache, CLEAN_CACHE_MINUTES * 60 * 1000);
  
  saveBazaarData()
  const bazaarDataSaveInterval = setInterval(saveBazaarData, BAZAAR_SAVE_MINUTES * 60 * 1000);

  updateAuctionCache()
  const updateAuctionCacheSaveInterval = setInterval(updateAuctionCache, AUCTION_CACHE_MINUTES * 60 * 1000)  
}
