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
    
    getPublicData(req.query.path?.toString() ?? "").then((data) => {
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