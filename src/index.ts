import { loadApi } from './api/api';

import dotenv from 'dotenv'

async function main() {
  dotenv.config()

  loadApi()
}


main()