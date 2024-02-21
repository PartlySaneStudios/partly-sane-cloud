import { json } from "body-parser";
import express from "express";
import { loadV1Endpoint } from "./v1/v1";
import { prisma } from "../backend/backend";
import { loadSkyblockPlayerEndpoint } from "./v1/hypixel/skyblockplayer";
import { loadHypixelSkyblockItemEndpoint } from "./v1/hypixel/skyblockitem";
import { loadPssPublicdataEndpoint } from "./v1/pss/publicdata";
import { loadPssMiddlemanagementResetpublicdataEndpoint } from "./v1/pss/middlemanagement/resetpublicdatacache";

export const api = express()


const USER_AGENT_BYPASS_ENDPOINTS = ["/v1/pss/middlemanagement/resetpublicdata"]

export function loadApi() {
  const port = 80;
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

      prisma.userAgents.create({
        data: {
          useragent: userAgent,
          time: Date.now()
        }
      })

      res.status(401)
      res.send("Unauthorized")
      return
    }

    next()
  })


  api.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  loadEndpoints()  
}

function loadEndpoints() {
  loadV1Endpoint()
  loadHypixelSkyblockItemEndpoint()
  loadSkyblockPlayerEndpoint()
  loadPssPublicdataEndpoint()
  loadPssMiddlemanagementResetpublicdataEndpoint()
}





