//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { env } from "process";
import { api } from "../../../api";
import { prisma } from "../../../../backend/backend";


export function loadPssMiddlemanagementResetpublicdataEndpoint() {
  api.get('/v1/pss/middlemanagement/resetpublicdata', (req, res) => {
    if (req.query.key != env.CLEAR_CACHE_KEY) {
      res.status(401)
      res.send("Unfortunately this file is not in the bathroom of a mansion, soooo skill iss-you?")
      res.end()
      return
    }

    prisma.publicData.deleteMany({}).then(() => {
      prisma.$disconnect()
      res.send("Successfully cleared the public data cache")
    }).catch(() => {
      res.status(500)
      res.send("Failed to clear the public data cache")
    })
  });
}