import { error } from "console";
import { getPublicData } from "../../../backend/PublicData";
import { api } from "../../api";



export function loadPssPublicdataEndpoint() {
  api.get('/v1/pss/publicdata', (req, res) => {

    if (req.query.path == null) {
      res.status(400)
      res.send("No file path provided")
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
    
    getPublicData(req.query.path?.toString() ?? "", owner, repo).then((data) => {
      res.send(data)
      return
    }).catch((error) => {
      console.log(500)
      res.send("Error retrieving file")
      res.end()
      return
    })

  });
}