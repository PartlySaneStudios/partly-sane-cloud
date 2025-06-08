//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { getSkyblockPlayerData } from "../../../backend/PlayerData";
import { prisma } from "../../../backend/backend";
import { api } from "../../api";



export function loadSkyblockPlayerEndpoint() {
  api.get('/v1/hypixel/skyblockplayer', async (req, res) => {

    if (req.query.uuid == null) {
      res.send("No uuid provided")
      res.status(400)
      res.end()
      return
    }

    const uuid = req.query.uuid!!.toString()

    await prisma.$connect()
    const cachedResponse = await prisma.skyblockPlayer.findFirst({
      where: {
        uuid: uuid
      }
    })

    if (cachedResponse != null) {
      res.send(JSON.parse(cachedResponse.response))

      prisma.$disconnect()
    } else {
      const data = await getSkyblockPlayerData(req.query.uuid!!.toString())
      if (data.success != true) {
        res.send(data.data)
        res.status(500)
        res.end()
      } else {
        res.send(data.data)
        res.end()

        prisma.$connect().then(() => {
          prisma.skyblockPlayer.createMany({
            skipDuplicates: true,
            data: {
              uuid: uuid,
              response: data.data,
              updateTime: Date.now()
            }
          }).then(() => {
            prisma.$disconnect()
          })
        })
      }
    }
  })
}