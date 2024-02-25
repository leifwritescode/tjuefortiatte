import { Context } from "@devvit/public-api";
import { Point, Tile, TileValue } from "./types.js";
import { GRID_DIMENSIONS } from "./constants.js";
import State from "./State.js";
import { G } from "vitest/dist/types-ad1c3f45.js";

type Move = "up" | "down" | "left" | "right"

type GameState = "in_play" | "game_over"

type Board = Map<Point, Tile>

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
    this._currentGameState = new State<GameState>(context, "in_play")
    this.reset()
  }

  reset() {
    const board = new Map<Point, Tile>()

    const a = TwentyFortyEightGame.getRandomUnpopulatedCell(board)
    if (!a) {
      throw new Error('No unpopulated cells found')
    } else {
      board.set(a, { position: a, value: TwentyFortyEightGame.getNextTileValue() })
    }

    const b = TwentyFortyEightGame.getRandomUnpopulatedCell(board)
    if (!b) {
      throw new Error('No unpopulated cells found')
    } else {
      board.set(b, { position: b, value: TwentyFortyEightGame.getNextTileValue() })
    }

    this.board = Array.from(board.values())
    this.score = 0
  }

  play(move: Move) {
    const board: Board = this.board.reduce((acc: Map<Point, Tile>, tile) => {
      acc.set(tile.position, tile)
      return acc
    }, new Map())

    const updatedBoard = this.processRequestedMove(board, move)
    if (!this.boardHasChanged(board, updatedBoard)) {
      return // board didn't change, so we ignore the move
    }

    // board changed, so now we need to find an unpopulated cell to spawn a new piece
    const spawnAt = TwentyFortyEightGame.getRandomUnpopulatedCell(updatedBoard)
    if (!spawnAt) {
      this.gameState = "game_over"
      return
    }

    // next, spawn a tile at the unpopulated cell
    const nextTileValue = TwentyFortyEightGame.getNextTileValue()
    updatedBoard.set(spawnAt, { position: spawnAt, value: nextTileValue })

    // lastly, determine if there are any legal moves following the spawn
    if (this.isGameOver(updatedBoard)) {
      this.gameState = "game_over"
      return
    }

    // and update the actual board
    this.board = Array.from(updatedBoard.values())
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

  get lastSpawnedAt(): Point {
    return this._lastSpawnedAt.value
  }

  private set lastSpawnedAt(value: Point) {
    this._lastSpawnedAt.value = value
  }

  private processRequestedMove(board: Board, move: Move): Board {
    const vector = VECTORS[move]
    const copyOfBoard = board

    let score = 0
    let moved: boolean

    do {
      moved = false

      // get all of the unpopulated cells
      const unpopulatedCells = TwentyFortyEightGame.getUnpopulatedCells(copyOfBoard)

      copyOfBoard.forEach((tile, position) => {
        const nextPosition = { x: position.x + vector.x, y: position.y + vector.y }

        // if the next position is out of bounds, skip
        if (nextPosition.x < 0 || nextPosition.x >= GRID_DIMENSIONS.w || nextPosition.y < 0 || nextPosition.y >= GRID_DIMENSIONS.h) {
          return
        }

        // if the next position is unpopulated, move the current piece to the next position
        if (unpopulatedCells.some(cell => cell.x === nextPosition.x && cell.y === nextPosition.y)) {
          copyOfBoard.set(nextPosition, tile)
          copyOfBoard.delete(position)
          moved = true
        }

        // if the next position is populated and has the same value, merge the two pieces
        else if (copyOfBoard.get(nextPosition)!.value === tile.value) {
          const delta = tile.value * 2 as TileValue
          copyOfBoard.set(nextPosition, { position: nextPosition, value: delta })
          copyOfBoard.delete(position)
          moved = true
          score += delta
        }
      })
    } while (moved)

    return copyOfBoard
  }

  private boardHasChanged(a: Board, b: Board): boolean {
    if (a.size !== b.size) {
      return true
    }

    for (const [position, tile] of a) {
      if (!b.has(position) || b.get(position)!.value !== tile.value) {
        return true
      }
    }

    return false
  }

  private static getUnpopulatedCells(board: Board) : Point[] {
    const unpopulatedCells: Point[] = [];

    for (let y = 0; y < GRID_DIMENSIONS.h; y++) {
      for (let x = 0; x < GRID_DIMENSIONS.w; x++) {
        const cell = { x, y }
        if (!board.has(cell)) {
          unpopulatedCells.push(cell);
        }
      }
    }
  
    return unpopulatedCells;
  }

  private static getRandomUnpopulatedCell(board: Board) : Point | undefined {
    const unpopulatedCells = this.getUnpopulatedCells(board);
    if (unpopulatedCells.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * unpopulatedCells.length);
    return unpopulatedCells[randomIndex];
  }

  private static getNextTileValue(): TileValue {
    const value = Math.round(Math.random() * 2) + 2
    return value as TileValue // we can guarantee that value is either 2 or 4
  }

  private isGameOver(board: Board): Boolean {
    let validMoveFound = false;
    board.forEach((tile, position) => {
      const adjacentCells = [
        { x: position.x - 1, y: position.y },
        { x: position.x + 1, y: position.y },
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + 1 }
      ]

      // a valid move is found if either the adjacent cell is unpopulated or has the same value as the current cell
      validMoveFound = validMoveFound || adjacentCells.some(cell => {
        return !board.has(cell) && board.get(cell)!.value === tile.value
      })
    })
    return validMoveFound
  }
}
