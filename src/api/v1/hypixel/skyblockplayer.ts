import { getSkyblockPlayerData } from "../../../backend/PlayerData";
import { prisma } from "../../../backend/backend";
import { api } from "../../api";



export function loadSkyblockPlayerEndpoint() {
  api.get('/v1/hypixel/skyblockplayer', (req, res) => {

    if (req.query.uuid == null) {
      res.status(400)
      res.send("No uuid provided")
      res.end()
      return
    }

    const uuid = req.query.uuid!!.toString()
    prisma.skyblockPlayer.findFirst({
      where: {
        uuid: uuid
      }
    }).then((cachedResponse) => {
      prisma.$disconnect()
      if (cachedResponse != null) {
        res.send(JSON.parse(cachedResponse.response))
      } else {
        getSkyblockPlayerData(req.query.uuid!!.toString()).then( (data) => {
          if (data.success != true) {
            res.status(500)
            res.send(data.data)
            res.end()
          } else {
            res.send(data.data)
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
            res.end()
          }
  
        }).catch((reason) => {
          console.error(reason)
          res.status(500)
          res.send("PSC Internal server error")
          res.end()
        })
      }
      })
    })
}