//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { api } from "../api";


export function loadV1Endpoint() {
  api.get('/v1/status', (req, res) => {
    res.status(200)
    res.send("{ success: true }")
    res.end()
  });
}