import { Dimensions, TileLookup } from "./types.js"

export const GRID_DIMENSIONS: Dimensions = { w: 4, h: 4 }
export const MAX_PERMITTED_TILE_POWER: number = 15
export const MAX_OCCUPIED_CELLS: number = 10

export const SCORES_LOOKUP: TileLookup = {
  [2]: 0,
  [4]: 4,
  [8]: 16,
  [16]: 48,
  [32]: 128,
  [64]: 256,
  [128]: 768,
  [256]: 1792,
  [512]: 4096,
  [1024]: 9216,
  [2048]: 20480,
  [4096]: 45056,
  [8192]: 98304,
  [16384]: 212992,
  [32768]: 458752,
  [65536]: 983040,
  [131072]: 2097152
}

const MOVES_LOOKUP: TileLookup = {
  [2]: 0,
  [4]: 1,
  [8]: 3,
  [16]: 7,
  [32]: 15,
  [64]: 31,
  [128]: 63,
  [256]: 127,
  [512]: 255,
  [1024]: 511,
  [2048]: 1023,
  [4096]: 2047,
  [8192]: 4095,
  [16384]: 8191,
  [32768]: 16383,
  [65536]: 32767,
  [131072]: 65535
}