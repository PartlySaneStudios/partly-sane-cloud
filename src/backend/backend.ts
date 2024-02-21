import { PrismaClient } from '@prisma/client';
import { cleanCache } from './CleanCache';
import { loadAuctionHouseData } from './itemdata/AuctionData';
import { loadBazaarData } from './itemdata/BazaarData';
import { loadItemData } from './itemdata/ItemData';

export const prisma = new PrismaClient()

export const CACHE_TIME_MINUTES = 10
const LOAD_ITEM_DATA_MINITES = 100
const LOAD_BAZAAR_DATA_MINUTES = 7
const LOAD_AUCTION_DATA_MINUTES = 12

export function loadBackend() {
  cleanCache()
  const cleanCacheInterval = setInterval(cleanCache, CACHE_TIME_MINUTES * 60 * 1000);
  
  loadItemData().then(() => {
    loadAuctionHouseData().catch((error) => {
      console.error(error)
    })
    loadBazaarData().catch((error) => {
      console.error(error)
    })
  }).catch((error) => {
    console.error(error)
  })

  const loadItemDataInterval = setInterval(loadItemData, LOAD_ITEM_DATA_MINITES * 60 * 1000)
  const loadBazaarDataInterval = setInterval(loadBazaarData, LOAD_BAZAAR_DATA_MINUTES * 60 * 1000)
  const loadAuctionDataInterval = setInterval(loadAuctionHouseData, LOAD_AUCTION_DATA_MINUTES * 60 * 1000)


}

