import { PrismaClient } from '@prisma/client'
import { cleanCache } from './CleanCache';
import { saveAuctionData } from './itemdata/AuctionData';
import { saveBazaarData } from './itemdata/BazaarData';
import { saveItemData } from './itemdata/ItemData';

export const prisma = new PrismaClient()

const CLEAN_CACHE_MINUTES = 1
const BAZAAR_SAVE_MINUTES = 5
const AUCTION_CACHE_MINUTES = 10
const ITEM_DATA_CACHE_MINUTES = 100

export function loadBackend() {
  cleanCache()
  const cleanCacheInterval = setInterval(cleanCache, CLEAN_CACHE_MINUTES * 60 * 1000);
  
  saveItemData().then(() => {
    
  })
  const saveItemDataInterval = setInterval(saveItemData, ITEM_DATA_CACHE_MINUTES * 60 * 1000)

}
