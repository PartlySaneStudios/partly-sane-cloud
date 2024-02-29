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
import { loadV1Endpoint } from "./v1/v1";

export const api = express()


const USER_AGENT_BYPASS_ENDPOINTS = [
  "/v1/pss/middlemanagement/resetpublicdata", 
  "/v1/status"
]

export function loadApi() {
  const httpPort = 80;
  const httpsPort = 443
  api.use(json())

  api.use((req, res, next) => {
    let index = req.url.indexOf("?")
    if (index == -1) {
      index = req.url.length
    }
    const endpoint = req.url.substring(0, index)
    
    if (USER_AGENT_BYPASS_ENDPOINTS.includes(endpoint.toLowerCase())) {
      next()
      return
    }

    if (req.headers["user-agent"] == null || !req.headers["user-agent"]!!.startsWith("Partly-Sane-Skies/")) { // If it is not a partly sane skies user agent

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


  api.listen(httpPort, () => {
    console.log(`Server running on port ${httpPort}`);
  });
  try {
    https.createServer(
      {
        key: fs.readFileSync(path.resolve(env.SSL_KEY ?? "")),
        cert: fs.readFileSync(path.resolve(env.SSL_CERT ?? ""))
      }, 
      api)
      .listen(httpsPort, () => {
      console.log(`Server running on port ${httpsPort}`);
    });
  } catch (error) {
    console.log(error)
  }
  


  loadEndpoints()  
}

function loadEndpoints() {
  loadV1Endpoint()
  loadHypixelSkyblockItemEndpoint()
  loadSkyblockPlayerEndpoint()
  loadPssPublicdataEndpoint()
  loadPssMiddlemanagementResetpublicdataEndpoint()
}
