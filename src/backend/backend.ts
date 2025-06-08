//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { PrismaClient } from '@prisma/client';
import { cleanCache } from './CleanCache';
import { loadAuctionHouseData } from './itemdata/AuctionData';
import { loadBazaarData } from './itemdata/BazaarData';
import { loadItemData } from './itemdata/ItemData';
import { loadFunFactData } from './FunFactData';

export const prisma = new PrismaClient()

export const PLAYER_CACHE_TIME_MINUTES = 10 // How long player data should be kept
export const UUID_CACHE_TIME_MINUTES = 37 * 24 * 60 * 1000 // How long uuid data should be kept (ultra long term ,, recommended minimum 1 month)
export const AUCTION_CACHE_TIME_MINUTES = 14 // How long auction data should be kept
export const PUBLIC_DATA_CACHE_TIME_MINUTES = 60 // How long public data repo should be cached before rerequesting
export const ITEM_DATA_HISTORY_CACHE_TIME_MINUTES = 60 * 24 * 2 // How long the item data should be kept in minutes (long term,, recommended minimum 1 day)
const LOAD_ITEM_DATA_MINUTES = 100 // How often (how long between) item data should be rerequested
const LOAD_BAZAAR_DATA_MINUTES = 7 // How often (how long between) bazaar data should be rerequested
const LOAD_AUCTION_DATA_MINUTES = 12 // How often (how long between) auction data should be rerequested

let loadItemDataInterval: any
let loadBazaarDataInterval: any
let loadAuctionDataInterval: any
let cleanCacheInterval: any

export async function loadBackend() {
  cleanCache()
  cleanCacheInterval = setInterval(cleanCache, PLAYER_CACHE_TIME_MINUTES * 60 * 1000);

  loadItemData()
    .then(() => {
      loadAuctionHouseData().catch((error) => {
        console.error(error)
      })
      loadBazaarData().catch((error) => {
        console.error(error)
      })
    }).catch((error) => {
      console.error(error)
    })

  loadItemDataInterval = setInterval(loadItemData, LOAD_ITEM_DATA_MINUTES * 60 * 1000)
  loadBazaarDataInterval = setInterval(loadBazaarData, LOAD_BAZAAR_DATA_MINUTES * 60 * 1000)
  loadAuctionDataInterval = setInterval(loadAuctionHouseData, LOAD_AUCTION_DATA_MINUTES * 60 * 1000)

  loadFunFactData()
}


export function cleanBackend() {
  // Clear intervals
  clearInterval(cleanCacheInterval);
  clearInterval(loadItemDataInterval);
  clearInterval(loadBazaarDataInterval);
  clearInterval(loadAuctionDataInterval);
}
