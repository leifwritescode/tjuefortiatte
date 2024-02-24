import { Devvit, ScheduledJobHandler, ScheduledJobType } from "@devvit/public-api";
import { Preview } from "./Components.js";

const widthAndHeight = 4
const maxPermittedPower = 15
const maxStartingSquares = 10

const scoresLookUp: { [key: number]: number } = {
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

// this assumes only two spawns, e.g. it's generousx
const movesLookUp: { [key: number]: number } = {
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

const generateDailyGameScheduledJobHandler: ScheduledJobHandler = async (event, context) => {
  const { reddit, redis } = context

  // between 1 and 10 starting cells
  const numOfStartingCells = Math.ceil(Math.random() * maxStartingSquares)

  // a set of starting values
  const startingCellValues = Array.from({
    length: numOfStartingCells
  }, () => {
    const pow = Math.ceil(Math.random() * maxPermittedPower);
    return Math.pow(2, pow);
  })

  // positions
  const startingCellPositions = Array.from({
    length: numOfStartingCells
  }, () => {
    const x = Math.ceil(Math.random() * widthAndHeight);
    const y = Math.ceil(Math.random() * widthAndHeight);
    return Math.floor(y * widthAndHeight + x)
  })

  // construct the grid
  const grid = Array.from({
    length: 16
  }, (_, index) => {
    if (startingCellPositions.includes(index)) {
      const indexOfValue = startingCellPositions.indexOf(index)
      return startingCellValues[indexOfValue]
    }
    return 0
  })

  // compute the _current_ score
  const score = startingCellValues.reduce((acc, value) => acc + scoresLookUp[value], 0)

  // compute the _current_ moves
  const moves = startingCellValues.reduce((acc, value) => acc + movesLookUp[value], 0)

  // compute the target score
  const largestStartingCellValue = Math.max(...startingCellValues)
  const targetScore = scoresLookUp[largestStartingCellValue] * 1.5
  const targetMoves = movesLookUp[largestStartingCellValue]

  // create the state
  const state = {
    score,
    targetScore,
    moves,
    targetMoves,
    grid
  }

  const today = new Date().toDateString()

  // and submit the post!
  const subreddit = await reddit.getCurrentSubreddit()
  const submission = await reddit.submitPost({
    preview: <Preview />,
    title: `Daily Tjueførtiåtte — ${today}`,
    subredditName: subreddit.name,
  })

  // save the state
  await redis.hset(submission.id, {
    "state": JSON.stringify(state),
  })
}

export const generateDailyGameScheduledJob: ScheduledJobType = {
  name: "Generate Daily Game",
  onRun: generateDailyGameScheduledJobHandler
}
