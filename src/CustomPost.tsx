import { Context, CustomPostType, Devvit } from "@devvit/public-api";
import { TwentyFortyEightGame } from "./TwentyFortyEightGame.js";
import { ScoreBox, GameBoard, ControlBox } from "./Components.js";
import State from "./State.js";

// contains score, target score, moves, target moves, and game state
// the players goal is to reach the target score without exceeding the target moves
const getDailyChallenge = async ({ postId, redis }: Context) => {
  if (!postId) {
    throw new Error('No postId provided')
  }

  const dailyChallenge = await redis.hget(postId, 'state')
  if (!dailyChallenge) {
    throw new Error('No daily challenge found')
  }

  return dailyChallenge
}

const getCurrentUser = async ({ reddit }: Context) : Promise<string> => {
  const user = await reddit.getCurrentUser()
  return user.username
}

const twentyFortyEightCustomPostComponent: Devvit.CustomPostComponent = (context) => {
  const { useState, redis, reddit } = context

  const game = new TwentyFortyEightGame(context)
  game.setup()

  const currentUser = new State(context, async () => await getCurrentUser(context))

  const allTimeHighScore = useState(async () => {
    const highScores = await redis.hgetall('highScores')
    if (!highScores) {
      console.log('no scores found at all')
      return -1
    }

    const keys = Object.keys(highScores)
    if (keys.length === 0) {
      console.log('no keys on score object')
      return -1
    }

    return Math.max(...keys.map((value) => Number(highScores[value])))
  })

  const playerBestScore = useState(async () => {
    const user = await reddit.getCurrentUser()
    const score = await redis.hget('highScores', user.username)
    if (!score) {
      console.log('no scores found for current player')
      return -1
    }

    return Number(score)
  })

  if (game.isGameOver()) {
    const currentScore = game.score
    const currentBest = playerBestScore[0]
    if (currentScore > currentBest) {
      const score = `${currentScore}`
      redis.hset('highScores', { [currentUser.value]: score })
    }

    return (
      <hstack backgroundColor='wheat' grow alignment='middle center'>
        <vstack gap='medium'>
          <text color='black' weight='bold' size='xxlarge' alignment='center'>Game Over!</text>
          <text color='black' weight='bold' size='xlarge' alignment='center'>You scored {game.score} points.</text>
          <button onPress={() => game.reset()}>Just One More?</button>
        </vstack>
      </hstack>
    )
  } else {
    return (
      <vstack backgroundColor='NavajoWhite' cornerRadius="medium" padding='medium' grow>
        <vstack backgroundColor='wheat' cornerRadius='medium' padding='medium' border='thin' borderColor='Tan' grow>
          <hstack gap='small'>
            <vstack alignment='middle'>
              <button appearance='destructive' onPress={() => game.reset()}>Reset</button>
            </vstack>
            <spacer grow />
            <ScoreBox title='Score' score={game.score} />
            <ScoreBox title='Your Best' score={playerBestScore[0]} />
            <ScoreBox title='All Time Best' score={allTimeHighScore[0]} />
          </hstack>
          <hstack alignment='middle center' grow>
            <spacer grow />
            <GameBoard game={game} />
            <spacer grow />
          </hstack>
          <ControlBox game={game} />
        </vstack>
      </vstack>
    )
  }
}

export const twentyFortyEightCustomPost: CustomPostType = {
  name: 'TwentyFortyEight',
  height: 'tall',
  render: twentyFortyEightCustomPostComponent,
}
