//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { env } from "process";
import { api } from "../../../api";
import { prisma } from "../../../../backend/backend";


export function loadPssMiddlemanagementResetpublicdataEndpoint() {
  api.get('/v1/pss/middlemanagement/resetpublicdata', async (req, res) => {
    if (req.query.key != env.CLEAR_CACHE_KEY) {
      res.send("Unfortunately this file is not in the bathroom of a mansion, soooo skill iss-you?")
      res.status(401)
      res.end()
      return
    }

    await prisma.publicData.deleteMany({}).then(() => {
      prisma.$disconnect()
      res.send("Successfully cleared the public data cache")
    }).catch(() => {
      res.send("Failed to clear the public data cache")
      res.status(500)
    })
  });
}