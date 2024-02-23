//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { Octokit } from 'octokit'
import { prisma } from './backend';
import { onCooldown } from '../utils/MathUtils';

const octokit = new Octokit({});


const PUBLIC_DATA_CACHE_TIME_MINUTES = 60

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
