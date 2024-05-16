//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { api } from "../api";


export function loadStatusEndpoint() {
  api.get('/v1/status', async (req, res) => {
    res.send("{ \"success\": true }")
    res.status(200)
    res.end()
  });
}