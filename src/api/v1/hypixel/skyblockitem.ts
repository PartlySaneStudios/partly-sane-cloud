import { getBazaarData } from "../../../backend/ItemData";
import { prisma } from "../../../backend/backend";
import { api } from "../../api";


let lastResponse = ""
let lastReponseTime = 0
const RESPONSE_CACHE_TIME_MINUTES = 5

export function loadBazaarDataEndpoint() {
  api.get('/v1/hypixel/skyblockitem', (req, res) => {
    if (lastReponseTime + RESPONSE_CACHE_TIME_MINUTES * 5 * 1000 > Date.now() ) {
      console.log("Sending Cached Data")
      res.send(lastResponse)
      res.end()
    } else {
      console.log("Sending New Data")
      getBazaarData().then( (data) => {
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