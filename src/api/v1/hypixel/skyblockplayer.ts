import { getSkyblockPlayerData } from "../../../backend/HypixelData";
import { api } from "../../api";



export function loadSkyblockPlayerEndpoint() {
  api.get('/v1/hypixel/skyblockplayer', (req, res) => {

    if (req.query.uuid == null) {
      res.status(400)
      res.send("No uuid provided")
      res.end()
      return
    }
  
    getSkyblockPlayerData(req.query.uuid!!.toString()).then( (data) => {
      if (data.success != true) {
        res.status(500)
        res.send(data.data)
        res.end()
      } else {
        res.send(data.data)
        res.end()
      }
    }).catch((reason) => {
      console.error(reason)
      res.status(500)
      res.send("PSC Internal server error")
      res.end()
    })
  });
}