import { json } from "body-parser";
import express from "express";
import { loadV1Endpoint } from "./v1/v1";
import { prisma } from "../backend/backend";
import { loadSkyblockPlayerEndpoint } from "./v1/hypixel/skyblockplayer";

export const api = express()

export function loadApi() {
  const port = 3000;
  api.use(json())

  api.use((req, res, next) => {
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
  loadSkyblockPlayerEndpoint()
}





