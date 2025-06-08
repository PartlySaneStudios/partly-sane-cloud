//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { fromUUID } from "../../../../backend/MojangAPI"
import { api } from "../../../api"


export function loadMojangAPIByUUIDEndpoint() {
  api.get('/v1/pss/mojangapi/byuuid', async (req, res) => {

    if (req.query.uuid == null) {
      res.send("No uuid provided")
      res.status(400)
      res.end()
      return
    }

    const name = req.query.name!!.toString()
    const data = await fromUUID(name)
    
    if (data.id == null || data.name == null) {
      res.send("Could not get name")
      res.status(400)
      res.end()
      return
    }

    res.send(JSON.stringify(data))
  })
}