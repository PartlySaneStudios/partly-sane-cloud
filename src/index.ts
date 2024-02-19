import { loadApi } from './api/api';

import { requestSkyblockProfilesEndpoint } from "./backend/HypixelData"
import dotenv from 'dotenv'

async function main() {
  dotenv.config()

  requestSkyblockProfilesEndpoint("d3edf183-d150-40a4-9754-5df5669c8878").then((response) => {
    console.log(`Response:${response}`)
  })

  loadApi()
}


main()