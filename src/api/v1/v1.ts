//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { api } from "../api";


export function loadV1Endpoint() {
  api.get('/v1', (req, res) => {

    res.send('Partly Sane Cloud API: V1 Endpoints Enabled');
  });
}