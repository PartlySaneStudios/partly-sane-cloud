import { getSkyblockItemData } from "../../../backend/itemdata/ItemData";
import { api } from "../../api";


let lastResponse = ""
let lastReponseTime = 0
const RESPONSE_CACHE_TIME_MINUTES = 5

export function loadSkyblockItemEndpoint() {
  api.get('/v1/hypixel/skyblockitem', (req, res) => {
    if (lastReponseTime + RESPONSE_CACHE_TIME_MINUTES * 5 * 1000 > Date.now() ) {
      console.log("Sending Cached Data")
      res.send(lastResponse)
      res.end()
    } else {
      console.log("Sending New Data")
      getSkyblockItemData().then( (data) => {
        if (data.success != true) {
          res.status(500)
          res.send(data.data)
          res.end()
        } else {
          res.send(data.data)
          res.end()
          lastResponse = data.data
          lastReponseTime = Date.now()
        }
      })
    }
  })
}