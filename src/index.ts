import { loadApi } from './api/api';

import dotenv from 'dotenv'
import { cleanCache } from './backend/CleanCache';
import { loadBackend } from './backend/backend';

const CLEAN_CACHE_MINUTES = 1
async function main() {
  dotenv.config()

  loadApi()
  loadBackend()
}


main()