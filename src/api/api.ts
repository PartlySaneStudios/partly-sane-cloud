//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { json } from "body-parser";
import express from "express";
import * as fs from 'fs';
import * as https from 'https';
import path from "path";
import { env } from "process";
import { loadHypixelSkyblockItemEndpoint } from "./v1/hypixel/skyblockitem";
import { loadSkyblockPlayerEndpoint } from "./v1/hypixel/skyblockplayer";
import { loadPssMiddlemanagementResetpublicdataEndpoint } from "./v1/pss/middlemanagement/resetpublicdatacache";
import { loadPssPublicdataEndpoint } from "./v1/pss/publicdata";
import { loadFunFactEndpoint } from "./v1/pss/funfact";
import { loadV1Endpoint } from "./v1/v1";
import { loadStatusEndpoint } from "./v1/status";

export const api = express()


const DEFAULT_ENDPOINT_SETTINGS: {
  validUserAgents: string[]
  ignoreAgentLogging: string[]
} = {
  validUserAgents: [],
  ignoreAgentLogging: []
}
const ENDPOINT_SETTINGS: Map<String, {
    validUserAgents: string[]
    ignoreAgentLogging: string[]
  }> = new Map<string, any>();

export function loadApi() {
  loadEndpointData()

  const httpPort = 80;
  const httpsPort = 443
  api.use(json())

  api.use((req, res, next) => {
    let index = req.url.indexOf("?")
    if (index == -1) {
      index = req.url.length
    }
    const endpoint = req.url.substring(0, index)


    let authorized = false
    const useragents = getValidUseragents(endpoint.toLowerCase())

    if (req.headers["user-agent"] != null) {
      for (let i = 0; i < useragents.length; i++) {
        const agent = useragents[i]
        if (req.headers["user-agent"]!!.startsWith(agent) || agent == "**/") {
          authorized = true;
          break
        }
      }
    }

    if (!authorized) { // If it is not a partly sane skies user agent

      let userAgent: string = "undefined"
      if (userAgent != null) {
        userAgent = req.headers["user-agent"]!!
      }

      res.status(401)
      res.send("Unauthorized")
      return
    }

    next()
  })


  api.listen(httpPort, "::", () => {
    console.log(`Server running on port ${httpPort}`);
  });

  try {
    https.createServer(
      {
        key: fs.readFileSync(path.resolve(env.SSL_KEY ?? "")),
        cert: fs.readFileSync(path.resolve(env.SSL_CERT ?? ""))
      },
      api)
      .listen(httpsPort, "::",() => {
        console.log(`Server running on port ${httpsPort}`);
      });
  } catch (error) {
    console.log(error)
    console.log("Unable to start https port")
  }



  loadEndpoints()
}

import useragentsJson from '../api/config/useragents.json'

function loadEndpointData() {
  DEFAULT_ENDPOINT_SETTINGS.ignoreAgentLogging = useragentsJson.default.ignoreLogging
  DEFAULT_ENDPOINT_SETTINGS.validUserAgents = useragentsJson.default.validAgents

  const endpoints: any = useragentsJson.endpoints 
  for (let i = 0; i < Object.keys(useragentsJson.endpoints).length; i++) {
    const endpoint =  Object.keys(useragentsJson.endpoints)[i]
    console.log(endpoint)
    const endpointSettings = endpoints[endpoint]
    console.log(endpointSettings)
    const validAgents = endpointSettings.validAgents
    const ignoreAgentLogging = endpointSettings.ignoreLogging
    ENDPOINT_SETTINGS.set(endpoint,  {
      validUserAgents: validAgents,
      ignoreAgentLogging: ignoreAgentLogging
    })
  }
}

function getValidUseragents(endpoint: string): string[] {
  return ENDPOINT_SETTINGS.get(endpoint)?.validUserAgents ?? DEFAULT_ENDPOINT_SETTINGS.validUserAgents
}

function loadEndpoints() {
  loadV1Endpoint()
  loadHypixelSkyblockItemEndpoint()
  loadSkyblockPlayerEndpoint()
  loadPssPublicdataEndpoint()
  loadFunFactEndpoint()
  loadPssMiddlemanagementResetpublicdataEndpoint()
  loadStatusEndpoint()
}
