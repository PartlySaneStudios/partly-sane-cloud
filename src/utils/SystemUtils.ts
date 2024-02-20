import * as nbt from 'prismarine-nbt';
import * as zlib from 'zlib';

export function serealizeBase64NBT(base64: string): any {
  const buffer = Buffer.from(base64, 'base64');

  const decompressedBuffer = zlib.unzipSync(buffer)
  return nbt.simplify(nbt.parseUncompressed(decompressedBuffer))

}