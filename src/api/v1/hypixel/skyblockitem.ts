import { getSkyblockItemEndpointResponse } from "../../../backend/itemdata/ItemData";
import { api } from "../../api";

export function loadHypixelSkyblockItemEndpoint() {
  api.get('/v1/hypixel/skyblockitem', (req, res) => {
    
    getSkyblockItemEndpointResponse().then((responseData) => {
      if (responseData.success == true) {
        res.send(responseData.data)
      } else {
        res.status(500)
        res.send("Interal Server Error")
      }
    })

  });
}