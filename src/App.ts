import { Context, UseStateResult } from "@devvit/public-api";

interface Coordinate {
  x: number,
  y: number
}

export type Move = "up" | "down" | "left" | "right"

type MoveResult = number | "invalid" | "game_over"

export const BOARD_WIDTH = 4
export const BOARD_HEIGHT = 4;

const USR_VALUE = 0;
const USR_SETTER = 1;

/**
 * I should modify the board state to be a simple array of numbers, as a first goal

 */

export class TwentyFortyEightGame {
  private _board: UseStateResult<number[]>
  private _score: UseStateResult<number>
  private _lastSpawnedAt: UseStateResult<Coordinate>

  constructor({ useState }: Context) {
    this._board = useState(new Array(BOARD_WIDTH * BOARD_HEIGHT).fill(-1))
    this._score = useState(0)
    this._lastSpawnedAt = useState({ x: -1, y: -1 })
  }

  setup() {
    // set the initial state of the board
    if (this.board.every((value) => value === -1)) {
      const a = this.findRandomIndex()
      const b = this.findRandomIndex();

      let newBoard = this.board;
      newBoard[a!] = 2
      newBoard[b!] = 2

      this.board = newBoard
    }
  }

  reset() {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        this.setCell({ x, y }, -1)
      }
    }

    this.setup()

    this.score = 0;
    this.lastSpawnedAt = { x: -1, y: -1 }
  }

  play(move: Move) {
    // process the given movement
    // and return the score 
    // score increases when two pieces merge by the value of the new piece
    // return "invalid" if the move is invalid
    // return "game_over" if there are no valid moves left

    let result: MoveResult;
    switch (move) {
      case "up":
        result = this.moveUp()
        break
      case "down":
        result = this.moveDown()
        break
      case "left":
        result = this.moveLeft()
        break
      case "right":
        result = this.moveRight()
        break
      default:
        throw new Error("Invalid move")
    }

    // force-save the board state
    this.updateBoard();

    // if the result is a number, then one or more valid moves were made
    // we can guarantee that a new piece can spawn under this condition
    if (typeof result === "number") {
      this.score += result
    }

    // an invalid result means nothing should spawn -- the board state wasn't changed
    else if (result === "invalid") {
      //return result;
    }

    // if we're still here, then we should spawn a new piece.
    // in the event that we cannot do so, the game is over.
    const randomIndex = this.findRandomIndex();
    if (randomIndex === null) {
      return
      //return "game_over";
    }

    // spawn a new piece
    // todo if the board state doesn't change, then we shouldn't spawn a new piece
    const x = randomIndex % BOARD_WIDTH
    const y = Math.floor(randomIndex / BOARD_WIDTH)
    this.setCell({ x, y }, 2)
    this.lastSpawnedAt = { x, y }


    // determine if the game is over
    const validTransitions = this.determineValidStateTransitions();
    if (!this.anyValidMoves(validTransitions)) {
      //return "game_over";
    }

    //return result
  }

  get score(): number {
    return this._score[USR_VALUE]
  }

  private set score(value: number) {
    this._score[USR_VALUE] = value
    this._score[USR_SETTER](value)
  }

  private get board(): number[] {
    return this._board[USR_VALUE]
  }

  private set board(value: number[]) {
    this._board[USR_VALUE] = value
  }

  private get lastSpawnedAt(): Coordinate {
    return this._lastSpawnedAt[USR_VALUE]
  }

  private set lastSpawnedAt(value: Coordinate) {
    this._lastSpawnedAt[USR_VALUE] = value
    this._lastSpawnedAt[USR_SETTER](value)
  }

  private getCell(coordinate: Coordinate) {
    return this.board[coordinate.y * BOARD_WIDTH + coordinate.x]
  }

  private setCell(coordinate: Coordinate, value: number) {
    this.board[coordinate.y * BOARD_WIDTH + coordinate.x] = value
  }

  private updateBoard() {
    this._board[USR_SETTER](this._board[USR_VALUE])
  }

  getRows(): number[][] {
    const rows: number[][] = []; 
    for (let i = 0; i < BOARD_HEIGHT; i++) {
      rows.push(this.board.slice(i * BOARD_WIDTH, (i + 1) * BOARD_WIDTH));
    }
    return rows;
  }

  isGameOver(): boolean {
    const validTransitions = this.determineValidStateTransitions();
    return !this.anyValidMoves(validTransitions);
  }

  isLastSpawned(cell: Coordinate) {
    return this.lastSpawnedAt.x === cell.x && this.lastSpawnedAt.y === cell.y
  }

  private moveUp() : MoveResult {
    let noMoreMoves = false;
    let score = 0;
    
    while (!noMoreMoves) {
      noMoreMoves = true;

      // start from the last row and work our way up
      for (var y = BOARD_HEIGHT - 1; y > 0; y--) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
          const yx = { x, y }
          const yx2 = { x, y: y - 1}
          const thisCellValue = this.getCell(yx)
          const otherCellValue = this.getCell(yx2)

          // if the current piece is empty, skip
          if (thisCellValue === -1) {
            continue;
          }

          // if the piece above is empty, move the current piece up
          if (otherCellValue === -1) {
            this.setCell(yx2, thisCellValue, )
            this.setCell(yx, -1)
            noMoreMoves = false;
          }

          // if the piece above is the same, merge the two pieces
          if (otherCellValue === thisCellValue) {
            const delta = thisCellValue * 2
            this.setCell(yx2, delta)
            this.setCell(yx, -1)
            noMoreMoves = false;
            score += delta
          }
        }
      }
    }

    return score
  }

  private moveDown() : MoveResult {
    let noMoreMoves = false;
    let score = 0
    
    while (!noMoreMoves) {
      noMoreMoves = true;

      // start from the first row and work our way down
      for (var y = 0; y < BOARD_HEIGHT - 1; y++) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
          const yx = { x, y }
          const yx2 = { x, y: y + 1 }
          const thisCellValue = this.getCell(yx)
          const otherCellValue = this.getCell(yx2)

          // if the current piece is empty, skip
          if (thisCellValue === -1) {
            continue;
          }

          // if the piece above is empty, move the current piece up
          if (otherCellValue === -1) {
            this.setCell(yx2, thisCellValue)
            this.setCell(yx, -1)
            noMoreMoves = false;
          }

          // if the piece above is the same, merge the two pieces
          if (otherCellValue === thisCellValue) {
            const delta = thisCellValue * 2
            this.setCell(yx2, delta)
            this.setCell(yx, -1)
            noMoreMoves = false;
            score += delta
          }
        }
      }
    }

    return score
  }

  private moveLeft() : MoveResult {
    let noMoreMoves = false;
    let score = 0
    
    while (!noMoreMoves) {
      noMoreMoves = true;

      for (var x = BOARD_WIDTH - 1; x > 0; x--) {
        for (var y = 0; y < BOARD_HEIGHT; y++) {
          const yx = { x, y }
          const yx2 = { x: x - 1 , y}
          const thisCellValue = this.getCell(yx)
          const otherCellValue = this.getCell(yx2)

          // if the current piece is empty, skip
          if (thisCellValue === -1) {
            continue;
          }

          // if the piece above is empty, move the current piece up
          if (otherCellValue === -1) {
            this.setCell(yx2, thisCellValue)
            this.setCell(yx, -1)
            noMoreMoves = false;
          }

          // if the piece above is the same, merge the two pieces
          if (otherCellValue === thisCellValue) {
            const delta = thisCellValue * 2
            this.setCell(yx2, delta)
            this.setCell(yx, -1)
            noMoreMoves = false;
            score += delta
          }
        }
      }
    }

    return score
  }

  private moveRight() : MoveResult {
    let noMoreMoves = false;
    let score = 0
    
    while (!noMoreMoves) {
      noMoreMoves = true;

      for (var x = 0; x < BOARD_WIDTH - 1; x++) {
        for (var y = 0; y < BOARD_HEIGHT; y++) {
          const yx = { x, y }
          const yx2 = { x: x + 1, y }
          const thisCellValue = this.getCell(yx)
          const otherCellValue = this.getCell(yx2)

          // if the current piece is empty, skip
          if (thisCellValue === -1) {
            continue;
          }

          // if the piece above is empty, move the current piece up
          if (otherCellValue === -1) {
            this.setCell(yx2, thisCellValue)
            this.setCell(yx, -1)
            noMoreMoves = false;
          }

          // if the piece above is the same, merge the two pieces
          if (otherCellValue === thisCellValue) {
            const delta = thisCellValue * 2
            this.setCell(yx2, delta)
            this.setCell(yx, -1)
            noMoreMoves = false;
            score += delta
          }
        }
      }
    }

    return score
  }

  private findRandomIndex() : number | null {
    const indices = this.board.reduce((result: number[], value: number, index: number) => {
      if (value === -1) result.push(index)
      return result
    }, [])

    // If there are no -1 values in the array, return null
    if (indices.length === 0) return null

    // Select a random index from the list of indices
    const randomIndex = Math.floor(Math.random() * indices.length)
    return indices[randomIndex]
  }

  private determineValidStateTransitions() : { [key in Move]: boolean } {
    const validTransitions: { [key in Move]: boolean } = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const index = y * BOARD_WIDTH + x;
        const currentValue = this.board[index];

        // Check if there is an empty cell adjacent to the current cell
        if (x > 0 && this.board[index - 1] === -1) {
          validTransitions.left = true;
        }
        if (x < BOARD_WIDTH - 1 && this.board[index + 1] === -1) {
          validTransitions.right = true;
        }
        if (y > 0 && this.board[index - BOARD_WIDTH] === -1) {
          validTransitions.up = true;
        }
        if (y < BOARD_HEIGHT - 1 && this.board[index + BOARD_WIDTH] === -1) {
          validTransitions.down = true;
        }

        // Check if there is a cell with the same value adjacent to the current cell
        if (x > 0 && this.board[index - 1] === currentValue) {
          validTransitions.left = true;
        }
        if (x < BOARD_WIDTH - 1 && this.board[index + 1] === currentValue) {
          validTransitions.right = true;
        }
        if (y > 0 && this.board[index - BOARD_WIDTH] === currentValue) {
          validTransitions.up = true;
        }
        if (y < BOARD_HEIGHT - 1 && this.board[index + BOARD_WIDTH] === currentValue) {
          validTransitions.down = true;
        }
      }
    }

    return validTransitions;
  }

  private anyValidMoves(moves: { [key in Move]: boolean }) : boolean {
    return Object.values(moves).some((value) => value)
  }
}