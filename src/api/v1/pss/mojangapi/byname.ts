//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { fromUsername } from "../../../../backend/MojangAPI"
import { api } from "../../../api"


export function loadMojangAPIByNameEndpoint() {
  api.get('/v1/pss/mojangapi/byname', async (req, res) => {

    if (req.query.name == null) {
      res.send("No name provided")
      res.status(400)
      res.end()
      return
    }

    const name = req.query.name!!.toString()
    const data = await fromUsername(name)
    
    if (data.id == null || data.name == null) {
      res.send("Could not get uuid")
      res.status(400)
      res.end()
      return
    }

    res.send(JSON.stringify(data))
  })
}