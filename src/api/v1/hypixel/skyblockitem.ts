//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { getSkyblockItemEndpointResponse } from "../../../backend/itemdata/ItemData";
import { api } from "../../api";

export function loadHypixelSkyblockItemEndpoint() {
  api.get('/v1/hypixel/skyblockitem', async (req, res) => {
    const responseData = await getSkyblockItemEndpointResponse()
    
    if (responseData.success == true) {
      res.send(responseData.data)
    } else {
      res.send("Internal Server Error")
      res.status(500)
    }
  });
}