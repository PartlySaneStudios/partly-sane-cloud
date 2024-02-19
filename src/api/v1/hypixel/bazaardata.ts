import { getBazaarData } from "../../../backend/ItemPrices";
import { prisma } from "../../../backend/backend";
import { api } from "../../api";



export function loadBazaarDataEndpoint() {
  api.get('/v1/hypixel/bazaardata', (req, res) => {
    prisma.skyblockPlayer.findMany({}).then((response) => {
      prisma.$disconnect()
    })
    
  
    getBazaarData().then( (data) => {
      if (data.success != true) {
        res.status(500)
        res.send(data.data)
        res.end()
      } else {
        res.send(data.data)
        res.end()
      }
    })
  })
}