import { Context } from "@devvit/public-api";
import { Point, Tile, TileValue } from "./types.js";
import { GRID_DIMENSIONS } from "./constants.js";
import State from "./State.js";

type Move = "up" | "down" | "left" | "right"

type GameState = "not_started" | "in_play" | "game_over"

const VECTORS = {
  [ "up" ]: { x: 0, y: -1 },
  [ "down" ]: { x: 0, y: 1 },
  [ "left" ]: { x: -1, y: 0 },
  [ "right" ]: { x: 1, y: 0 }
}

/**
 * I should modify the board state to be a simple array of numbers, as a first goal

 */

export default class TwentyFortyEightGame {
  private _board: State<Tile[]>
  private _score: State<number>
  private _lastSpawnedAt: State<Point>
  private _currentGameState: State<GameState>

  constructor(context: Context) {
    this._board = new State<Tile[]>(context, [])
    this._score = new State<number>(context, 0)
    this._lastSpawnedAt = new State<Point>(context, { x: -1, y: -1 })
    this._currentGameState = new State<GameState>(context, "not_started")
    this.reset()
  }

  reset() {
    console.log(`reset called with game state ${this.gameState}`)
    if (this.gameState === "in_play") {
      return
    }

    let board: Tile[] = []

    const a = TwentyFortyEightGame.getRandomUnpopulatedCell(board)
    if (!a) {
      throw new Error('No unpopulated cells found')
    } else {
      board.push({ position: a, value: TwentyFortyEightGame.getNextTileValue() })
    }

    const b = TwentyFortyEightGame.getRandomUnpopulatedCell(board)
    if (!b) {
      throw new Error('No unpopulated cells found')
    } else {
      board.push({ position: b, value: TwentyFortyEightGame.getNextTileValue() })
    }

    this.board = board
    console.log(this.board)
    this.score = 0
    this._lastSpawnedAt.value = b
    this._currentGameState.value = "in_play"
  }

  play(move: Move) {
    const updatedBoard = this.processRequestedMove(this.board, move)
    if (!this.boardHasChanged(this.board, updatedBoard)) {
      console.log('board did not change')
      return // board didn't change, so we ignore the move
    }
    console.log(updatedBoard);

    // board changed, so now we need to find an unpopulated cell to spawn a new piece
    const spawnAt = TwentyFortyEightGame.getRandomUnpopulatedCell(updatedBoard)
    if (!spawnAt) {
      console.log('no unpopulated cells found, forcing game over')
      this.gameState = "game_over"
      return
    }

    // next, spawn a tile at the unpopulated cell
    const nextTileValue = TwentyFortyEightGame.getNextTileValue()
    updatedBoard.push({ position: spawnAt, value: nextTileValue })

    // lastly, determine if there are any legal moves following the spawn
    if (this.isGameOver(updatedBoard)) {
      console.log('no legal moves found, forcing game over')
      this.gameState = "game_over"
      return
    }

    // and update the actual board
    this.board = Array.from(updatedBoard.values())
    console.log(this.board)
  }

  get gameState(): GameState {
    return this._currentGameState.value
  }

  private set gameState(value: GameState) {
    this._currentGameState.value = value
  }

  get score(): number {
    return this._score.value
  }

  private set score(value: number) {
    this._score.value = value
  }

  get board(): Tile[] {
    return this._board.value
  }

  private set board(value: Tile[]) {
    this._board.value = value
  }

  lastSpawnedAt(point: Point): boolean {
    return this._lastSpawnedAt.value.x === point.x && this._lastSpawnedAt.value.y === point.y
  }

  private processRequestedMove(board: Tile[], move: Move): Tile[] {
    const vector = VECTORS[move]
    console.log(`processing move ${move} which has vector ${JSON.stringify(vector)}`)
    const copyOfBoard = Array.from(board)

    let score = 0
    let moved: boolean

    do {
      moved = false

      // get all of the unpopulated cells
      const unpopulatedCells = TwentyFortyEightGame.getUnpopulatedCells(copyOfBoard)

      copyOfBoard.forEach((tile) => {
        const nextPosition = { x: tile.position.x + vector.x, y: tile.position.y + vector.y }

        // if the next position is out of bounds, skip
        if (nextPosition.x < 0 || nextPosition.x >= GRID_DIMENSIONS.w || nextPosition.y < 0 || nextPosition.y >= GRID_DIMENSIONS.h) {
          console.log('next position is out of bounds')
          return
        }

        // if the next position is unpopulated, move the current piece to the next position
        if (unpopulatedCells.some(cell => cell.x === nextPosition.x && cell.y === nextPosition.y)) {
          copyOfBoard.push(tile)
          const index = copyOfBoard.indexOf(tile, 0)
          if (index > -1) {
            copyOfBoard.splice(index, 1)
          }
          moved = true
          console.log('moved')
        }

        // if the next position is populated and has the same value, merge the two pieces
        else {
          const nextTile = copyOfBoard.find(x => x.position.x === nextPosition.x && x.position.y === nextPosition.y)
          if (nextTile && nextTile.value === tile.value) {
            const delta = tile.value * 2 as TileValue
            copyOfBoard.push({ position: nextPosition, value: delta })
            const index = copyOfBoard.indexOf(tile, 0)
            if (index > -1) {
              copyOfBoard.splice(index, 1)
            }
            moved = true
            score += delta
            console.log('merged')
          }
        }
      })
    } while (moved)

    return copyOfBoard
  }

  private boardHasChanged(a: Tile[], b: Tile[]): boolean {
    if (a.length !== b.length) {
      console.log('size is different')
      return true
    }

    for (const tile of a) {
      const c = b.find(x => x.position.x === tile.position.x && x.position.y === tile.position.y)
      if (!c || c.value !== tile.value) {
        console.log('tile value is different')
        return true
      }
    }

    console.log('board has not changed')
    return false
  }

  private static getUnpopulatedCells(board: Tile[]) : Point[] {
    const unpopulatedCells: Point[] = [];

    for (let y = 0; y < GRID_DIMENSIONS.h; y++) {
      for (let x = 0; x < GRID_DIMENSIONS.w; x++) {
        const cell = { x, y }
        if (!board.some(tile => tile.position.x === x && tile.position.y === y)) {
          unpopulatedCells.push(cell);
        }
      }
    }
  
    console.log(`there are ${unpopulatedCells.length} unpopulated cells`)
    return unpopulatedCells;
  }

  private static getRandomUnpopulatedCell(board: Tile[]) : Point | undefined {
    const unpopulatedCells = this.getUnpopulatedCells(board);
    if (unpopulatedCells.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * unpopulatedCells.length);
    console.log(`random index is ${randomIndex}`)
    return unpopulatedCells[randomIndex];
  }

  private static getNextTileValue(): TileValue {
    const value = Math.round(Math.random()) * 2 + 2
    console.log(`next tile value is ${value}`)
    return value as TileValue // we can guarantee that value is either 2 or 4
  }

  private isGameOver(board: Tile[]): Boolean {
    let validMoveFound = false;
    board.forEach((tile) => {
      const adjacentCells = [
        { x: tile.position.x - 1, y: tile.position.y },
        { x: tile.position.x + 1, y: tile.position.y },
        { x: tile.position.x, y: tile.position.y - 1 },
        { x: tile.position.x, y: tile.position.y + 1 }
      ]

      // a valid move is found if either the adjacent cell is unpopulated or has the same value as the current cell
      validMoveFound = validMoveFound || adjacentCells.some(cell => {
        const c = board.find(x => x.position.x === cell.x && x.position.y === cell.y)
        return !c || c.value === tile.value
      })
    })

    console.log(`valid move found: ${validMoveFound}`)
    return !validMoveFound
  }
}
