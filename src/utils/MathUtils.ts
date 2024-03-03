//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

export function onCooldown(startTime: number, length: number): boolean {
  return startTime + length > Date.now()
}