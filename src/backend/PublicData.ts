

import { Octokit } from 'octokit'
import { prisma } from './backend';
import { onCooldown } from '../utils/MathUtils';

const octokit = new Octokit({});


const PUBLIC_DATA_CACHE_TIME_MINUTES = 60

export async function getPublicData(path: string): Promise<string> {

  const foundData = await prisma.publicData.findUnique({
    where: {
      path: path
    }
  })

  prisma.$disconnect()

  let data = ""

  if (foundData == null) {
    data = await getData(path, "PartlySaneStudios", "partly-sane-skies-public-data")
    prisma.publicData.createMany({
      skipDuplicates: true,
      data: {
        path: path,
        data: data
      }
    }).then(() => {
      prisma.$disconnect()
    })
  } else {
    if (!onCooldown(foundData.lastTimeUpdate.getTime(), PUBLIC_DATA_CACHE_TIME_MINUTES * 60 * 1000)) { // if the cache is expired
      data = await getData(path, "PartlySaneStudios", "partly-sane-skies-public-data")
      prisma.publicData.update({
        where: {
          path: path
        },
        data: {
          data: data,
          lastTimeUpdate: new Date(Date.now())
        }
      }).then(() => {
        prisma.$disconnect()
      })
    } else {
      data = foundData.data
    }
  }

  return data
}




/*
* @param {string} path
* @param {string} owner
* @param {string} repo
* @returns {object} {json, sha}
*/
async function getData(path: string, owner: string, repo: string): Promise<string> {
  try {
    Octokit
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: owner,
          repo: repo,
          path: path,
          headers: {
              'X-GitHub-Api-Version': '2022-11-28'
          }
          });
          const data: any = response.data;
  
          // Decode the content from Base64 to UTF-8
          const decodedContent = Buffer.from(data.content ?? "", 'base64').toString('utf-8');

      return decodedContent;
  }
  catch (error) {
      console.error('Error fetching or decoding file content:', error);
      throw error; // Re-throw the error to signal that something went wrong
  }
}
