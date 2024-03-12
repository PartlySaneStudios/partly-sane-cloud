//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

import { getDailyFunFact } from "../../../backend/FunFactData";
import { api } from "../../api";


export function loadFunFactEndpoint() {
    api.get('/v1/pss/funfact', async (req, res) => {
        const funFact = await getDailyFunFact()

        res.status(200).send(`{"funFact": "${funFact}"}`)
    });
}