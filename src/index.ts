import { loadApi } from './api/api';

import dotenv from 'dotenv'
import { cleanCache } from './backend/CleanCache';
import { loadBackend, prisma } from './backend/backend';

const CLEAN_CACHE_MINUTES = 1
async function main() {
  dotenv.config()

  loadApi()
  prisma.$connect().then(() => {
    loadBackend()

  })
}


main()