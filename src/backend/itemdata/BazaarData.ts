import { prisma } from "../backend"

async function requestSkyblockBazaarEndpoint() {
  const url = `https://api.hypixel.net/v2/skyblock/bazaar`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}


export async function saveBazaarData() {
  console.log("Saving bazaar data")
  requestBazaarData().then((data) => {
    if (!data.success) {
      return
    }
    
    const bazaarData= data.data.products
    const promises: Promise<any>[] = []
    bazaarData.forEach((product) => {
      promises.push(new Promise<void>((resolve, reject) => {
        prisma.averageLowestBazaarData.create({
        data: {
          itemId: product.itemId,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          time: Date.now()
        }
        }).then(() => {
          resolve()
        })
      }
      ))
    })

    bazaarData.forEach((product) => {
      prisma.itemData.findFirst({
        where: {itemId: product.itemId}
      }).then((response) => {
        if (response != null) {
          promises.push(new Promise<void>((resolve, reject) => {prisma.itemData.update({
            where: {
              itemId: product.itemId
            },
            data: {
              bazaarBuyPrice: product.buyPrice,
              bazaarSellPrice: product.sellPrice
            }
          }).then(() => {
            resolve()
          })
        }))
        }
      })
    })

    Promise.all(promises).then(() => {
      console.log("finished saving bazaar data")
      prisma.$disconnect()
    })
  })
}


async function requestBazaarData(): Promise<{ success: boolean; data:  {
  products: {
    itemId: string
    buyPrice: number
    sellPrice: number
  }[]
}}> {
  const data: {
    products: {
      itemId: string
      buyPrice: number
      sellPrice: number
    }[]
  } = {
    products: []
  } 

  const response = await JSON.parse(await requestSkyblockBazaarEndpoint())

  if (response?.success != true) {
    return {
      success: false,
      data: response
    }
  }

  const bazaarData = response?.products
  const itemIds = Object.keys(bazaarData)

  for (let i = 0; i < itemIds.length; i++) {
    const string = itemIds[i]
  
    const itemData = bazaarData[string]
    const sellSummary: any[] = itemData.sell_summary

    let lowestSellPrice = sellSummary[0]?.pricePerUnit ?? 0
    sellSummary.forEach((value) => {
      if (value.pricePerUnit < lowestSellPrice) {
        lowestSellPrice = value.pricePerUnit
      }
    })

    const buySummary: any[] = itemData.buy_summary

    let highestBuyPrice = buySummary[0]?.pricePerUnit ?? 0
    buySummary.forEach((value) => {
      if (value.pricePerUnit > highestBuyPrice) {
        highestBuyPrice = value.pricePerUnit
      }
    })

    data.products.push({
      itemId: string,
      buyPrice: highestBuyPrice,
      sellPrice: lowestSellPrice,
    })
  }
  
  return {
    success: true,
    data: data
  }
}


export async function getBazaarData(itemId: string): Promise<{ buyPrice: number; sellPrice: number; averageBuy: number; averageSell: number }> {
  const averageData = await getAverageLowestBazaar(itemId, 24*1000*60*60) 
    const currentData =  await prisma.itemData.findFirst({
      where: {
        itemId: itemId
      }
    })
    prisma.$disconnect()
    let buyPrice = 0;
    let sellPrice = 0;
    let averageBuy = 0;
    let averageSell = 0;
    if (currentData != null) {
      buyPrice = currentData.bazaarBuyPrice
      sellPrice = currentData.bazaarSellPrice
    }
    if (averageData != null) {
      averageBuy = averageData.averageBuy
      averageSell = averageData.averageSell
    }

    return {
      buyPrice: buyPrice,
      sellPrice: sellPrice,
      averageBuy: averageBuy,
      averageSell: averageSell
    }

  
}

async function getAverageLowestBazaar(itemId: string, timePeriodMs: number): Promise<{ averageBuy: number; averageSell: number }> {
  let entries = await prisma.averageLowestBazaarData.findMany({
    where: {
      AND: {
        itemId: itemId,
        time: {
          gte: (Date.now() - timePeriodMs)
        }
      }
    }
  })
  prisma.$disconnect()

  // Sorts by time so the trapazoidal Riemann sum works
  entries = entries.sort((a, b) => {
    if (a.time < b.time) {
      return -1
    } else if (a.time < b.time) {
      return 1
    }
    return 0
  })



  // Finds the trapazoidal Riemann sum to find an estimate of the integral
  let previousTime = entries[0]?.time ?? 0
  let buySum = 0
  let sellSum = 0

  for (let i = 1; i < entries.length - 1; i++) {
    const buyLeftSide = entries[i - 1].buyPrice
    const buyRightSide = entries[i].buyPrice
    const sellLeftSide = entries[i - 1].sellPrice
    const sellRightSide = entries[i].sellPrice
    const height = entries[i].time - previousTime

    buySum += .5 * (buyLeftSide + buyRightSide) * Number(height)
    sellSum += .5 * (sellLeftSide + sellRightSide) * Number(height)
  }


  // Finds the average derivative (rate of change) of the riemann sum
  let firstTime = entries[0]?.time ?? 0
  let lastTime = entries[entries.length - 1]?.time ?? 0
  let deltaTime = firstTime - lastTime
  let averageBuy = -1
  let averageSell = -1
  if (deltaTime ==BigInt(0)) {
    averageBuy = entries[0]?.buyPrice ?? -1
    averageSell = entries[0]?.sellPrice ?? -1
  } else {
    averageBuy = buySum / Number(deltaTime)
    averageSell = sellSum / Number(deltaTime)
  }
  
  return {
    averageBuy: averageBuy,
    averageSell: averageSell
  }

}