//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

import { Octokit } from 'octokit'
import * as nbt from 'prismarine-nbt';
import * as zlib from 'zlib';

const octokit = new Octokit({});

export function serializeBase64NBT(base64: string): any {
  const buffer = Buffer.from(base64, 'base64');

  const decompressedBuffer = zlib.unzipSync(buffer)
  return nbt.simplify(nbt.parseUncompressed(decompressedBuffer))

}

/**
* @param {string} path
* @param {string} owner
* @param {string} repo
* @returns {object} {json, sha}
*/
export async function getData(path: string, owner: string, repo: string): Promise<string> {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        "Accept": "application/vnd.github.v3.raw"
      }
      
    });
    const data: any = response.data;
    
    // Not needed with the header "Accept": "application/vnd.github.v3.raw"
    // // Decode the content from Base64 to UTF-8
    // const decodedContent = Buffer.from(data.content ?? "", 'base64').toString('utf-8');

    return data;
  }
  catch (error) {
    console.error('Error fetching or decoding file content:', error);
    throw error; // Re-throw the error to signal that something went wrong
  }
}