//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { PUBLIC_DATA_CACHE_TIME_MINUTES, prisma } from './backend';
import { onCooldown } from '../utils/MathUtils';
import { getData } from '../utils/SystemUtils';


export async function getPublicData(path: string, owner: string, repo: string): Promise<string> {

  const foundData = await prisma.publicData.findFirst({
    where: {
      AND: {
        path: path,
        repo: repo,
        owner: owner
      }
    }
  })

  prisma.$disconnect()

  let data = ""

  if (foundData == null) {
    data = await getData(path, owner, repo)
    prisma.publicData.createMany({
      skipDuplicates: true,
      data: {
        path: path,
        owner: owner,
        repo: repo,
        data: data
      }
    }).then(() => {
      prisma.$disconnect()
    }).catch((error) => {
      console.error(error)
    })
  } else {
    if (!onCooldown(foundData.lastTimeUpdate.getTime(), PUBLIC_DATA_CACHE_TIME_MINUTES * 60 * 1000)) { // if the cache is expired
      data = await getData(path, owner, repo)
      prisma.publicData.updateMany({
        where: {
          path: path,
          owner: owner,
          repo: repo
        },
        data: {
          data: data,
          lastTimeUpdate: new Date(Date.now())
        }
      }).then(() => {
        prisma.$disconnect()
      }).catch((error) => {
        console.error(error)
      })
    } else {
      data = foundData.data
    }
  }

  return data
}
