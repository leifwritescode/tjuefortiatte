export type Point = { x: number, y: number }
export type Dimensions = { w: number, h: number }

export type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768 | 65536 | 131072

export type Tile = {
  value: TileValue
  position: Point
}

export type TileLookup = { [key in TileValue]: number }
