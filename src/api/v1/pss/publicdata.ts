//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { getPublicData } from "../../../backend/PublicData";
import { api } from "../../api";



export function loadPssPublicdataEndpoint() {
  api.get('/v1/pss/publicdata', async (req, res) => {

    if (req.query.path == null) {
      res.send("No file path provided")
      res.status(400)
      res.end()
      return
    }

    let repo = "partly-sane-skies-public-data"
    let owner = "PartlySaneStudios"

    if (req.query.repo != null) {
      repo = req.query.repo?.toString() ?? repo
    }

    if (req.query.owner != null) {
      owner = req.query.owner?.toString() ?? owner
    }

    await getPublicData(req.query.path?.toString() ?? "", owner, repo).then((data) => {
      res.send(data)
      res.status(200)
      return
    }).catch((error) => {
      res.send("Error retrieving file")
      console.log(500)
      res.end()
      return
    })

  });
}