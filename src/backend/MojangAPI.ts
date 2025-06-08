//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { prisma } from "./backend";


export type MojangAPIResponse = {
  id: string;
  name: string;
}

export async function fromUsername(name: string): Promise<MojangAPIResponse> {
  await prisma.$connect()
  const cachedResponse = await prisma.uUID.findFirst({
    where: {
      username: name
    }
  })

  if (cachedResponse != null) {
    prisma.$disconnect()
    return { id: cachedResponse.uuid, name: cachedResponse.username }
  } else {
    const url = `https://api.minecraftservices.com/minecraft/profile/lookup/name/${name}`

    try {
      const response = await (await fetch(url)).text()
      const json = JSON.parse(response)
      prisma.$connect().then(() => {
        prisma.uUID.createMany({
          skipDuplicates: true,
          data: {
            uuid: json.id,
            username: json.name,
          }
        }).then(() => {
          prisma.$disconnect()
        })
      })
      return { id: json.id, name: json.name }
    }
    catch (exception) {
      console.error(exception)
      return { name: "", id: "" }
    }
  }
}

export async function fromUUID(uuid: string): Promise<MojangAPIResponse> {
  await prisma.$connect()
  const cachedResponse = await prisma.uUID.findFirst({
    where: {
      uuid: uuid
    }
  })

  if (cachedResponse != null) {
    prisma.$disconnect()
    return { id: cachedResponse.uuid, name: cachedResponse.username }
  } else {
    const url = `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`

    try {
      const response = await (await fetch(url)).text()
      const json = JSON.parse(response)
      prisma.$connect().then(() => {
        prisma.uUID.createMany({
          skipDuplicates: true,
          data: {
            uuid: json.id,
            username: json.name,
          }
        }).then(() => {
          prisma.$disconnect()
        })
      })
      return { id: json.id, name: json.name }
    }
    catch (exception) {
      console.error(exception)
      return { name: "", id: "" }
    }
  }
}