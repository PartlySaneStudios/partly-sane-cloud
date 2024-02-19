

export function onCooldown(startTime: number, length: number): boolean {
  return startTime + length > Date.now() 
}
