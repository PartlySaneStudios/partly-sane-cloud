import { PrismaClient } from '@prisma/client'
import { cleanCache } from './CleanCache';
// import { saveBazaarData } from './ItemPrices';
import { loadItemData } from './itemdata/ItemData';
import { loadBazaarData } from './itemdata/BazaarData';
import { loadHypixelSkyblockItemEndpoint } from '../api/v1/hypixel/skyblockitem';

export const prisma = new PrismaClient()

const CLEAN_CACHE_MINUTES = 1

export function loadBackend() {
  cleanCache()
  const cleanCacheInterval = setInterval(cleanCache, CLEAN_CACHE_MINUTES * 60 * 1000);
  
  loadItemData()
  loadBazaarData()
  // saveBazaarData()
  // const bazaarDataSaveInterval = setInterval(saveBazaarData, CLEAN_CACHE_MINUTES * 60 * 1000);
}

