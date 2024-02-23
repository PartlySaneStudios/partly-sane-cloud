//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { loadApi } from './api/api';

import dotenv from 'dotenv';
import { cleanBackend, loadBackend, prisma } from './backend/backend';

const CLEAN_CACHE_MINUTES = 1
async function main() {
  dotenv.config()

  // Clean up resources on application exit
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  function cleanup() {
      cleanBackend()

      // Close Prisma Client connection
      prisma.$disconnect();

      // Exit the process
      process.exit(0);
  }


  loadApi()
  prisma.$connect().then(() => {
    loadBackend()
  })
}

main()
