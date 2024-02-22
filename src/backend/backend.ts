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

let loadItemDataInterval: any
let loadBazaarDataInterval: any
let loadAuctionDataInterval: any
let cleanCacheInterval: any

export function loadBackend() {
  cleanCache()
  cleanCacheInterval = setInterval(cleanCache, CACHE_TIME_MINUTES * 60 * 1000);
  
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

  loadItemDataInterval = setInterval(loadItemData, LOAD_ITEM_DATA_MINITES * 60 * 1000)
  loadBazaarDataInterval = setInterval(loadBazaarData, LOAD_BAZAAR_DATA_MINUTES * 60 * 1000)
  loadAuctionDataInterval = setInterval(loadAuctionHouseData, LOAD_AUCTION_DATA_MINUTES * 60 * 1000)


}


export function cleanBackend() {
  // Clear intervals
  clearInterval(cleanCacheInterval);
  clearInterval(loadItemDataInterval);
  clearInterval(loadBazaarDataInterval);
  clearInterval(loadAuctionDataInterval);
}
