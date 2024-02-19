import { prisma } from "./backend"



async function requestSkyblockItemsEndpoint() {
  const url = `https://api.hypixel.net/v2/resources/skyblock/items`
  try {
    const response = await (await fetch(url)).text()
    return response
  } catch(exception) {
    console.error(exception)
    return ""
  }
}

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
  const data = await getBazaarData()

  if (!data.success) {
    return
  }

  const bazaarData: any[] = JSON.parse(data.data).products
  
  bazaarData.forEach((product) => {
    prisma.bazaarItemPrice.create({
      data: {
        itemId: product.itemId,
        buyOrderPrice: product.buyOrderPrice,
        sellOrderPrice: product.sellOrderPrice,
        time: Date.now()
      }
    })
    prisma.$disconnect()
    
  })
}

export async function getBazaarData(): Promise<{ success: boolean; data: string }> {
  const data: {
    products: {
      itemId: string
      buyOrderPrice: number
      sellOrderPrice: number
      averageBuy: number
      averageSell: number
    }[]
  } = {
    products: []
  } 

  const response = await JSON.parse(await requestSkyblockBazaarEndpoint())

  if (response?.success != true) {
    return {
      success: false,
      data: JSON.stringify(response)
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

    const averageData = await getAverageLowestBazaar(string, 24 * 60 * 60 * 1000)
    let averageBuy = highestBuyPrice
    let averageSell = lowestSellPrice

    if (averageData.averageBuy != -1) {
      averageBuy = averageData.averageBuy
    }
    if (averageData.averageSell != -1) {
      averageSell = averageData.averageSell
    }

    data.products.push({
      itemId: string,
      buyOrderPrice: highestBuyPrice,
      sellOrderPrice: lowestSellPrice,
      averageBuy: averageBuy,
      averageSell: averageSell
    })
  }
  
  return {
    success: true,
    data: await JSON.stringify(data)
  }
}

async function getAverageLowestBazaar(itemId: string, timePeriodMs: number): Promise<{ averageBuy: number; averageSell: number }> {
  let entries = await prisma.bazaarItemPrice.findMany({
    where: {
      AND: {
        itemId: itemId,
        time: {
          gte: (Date.now() - timePeriodMs)
        }
      }
    }
  })

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
    const buyLeftSide = entries[i - 1].buyOrderPrice
    const buyRightSide = entries[i].buyOrderPrice
    const sellLeftSide = entries[i - 1].sellOrderPrice
    const sellRightSide = entries[i].sellOrderPrice
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
    averageBuy = entries[0]?.buyOrderPrice ?? -1
    averageSell = entries[0]?.sellOrderPrice ?? -1
  } else {
    averageBuy = buySum / Number(deltaTime)
    averageSell = sellSum / Number(deltaTime)
  }
  
  return {
    averageBuy: averageBuy,
    averageSell: averageSell
  }

}