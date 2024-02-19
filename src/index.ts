import { loadApi } from './api/api';

import dotenv from 'dotenv';
import { loadBackend } from './backend/backend';

async function main() {
  dotenv.config()

  loadApi()
  loadBackend()
}

main()
