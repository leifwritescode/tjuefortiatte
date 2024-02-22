import { Devvit } from '@devvit/public-api'
import { TwentyFortyEightGame } from './App.js'
import { ControlBox, GameBoard, ScoreBox } from './Components.js'

const backgroundColors: { [key: number]: string } = {
  [2]: 'khaki',
  [4]: 'gold',
  [8]: 'orange',
  [16]: 'darkorange',
  [32]: 'orangered',
  [64]: 'red',
  [128]: 'lightcoral',
  [256]: 'firebrick',
  [512]: 'maroon',
  [1024]: 'darkred',
  [2048]: 'hotpink',
  [4096]: 'deeppink',
  [8192]: 'mediumvioletred',
  [16384]: 'blueviolet',
  [32768]: 'purple',
  [65536]: 'indigo',
  [131072]: 'black',
}

const textColors: { [key: number]: string } = {
  [2]: 'black',
  [4]: 'black',
  [8]: 'black',
  [16]: 'black',
  [32]: 'black',
  [64]: 'black',
  [128]: 'black',
  [256]: 'black',
  [512]: 'black',
  [1024]: 'black',
  [2048]: 'black',
  [4096]: 'black',
  [8192]: 'white',
  [16384]: 'white',
  [32768]: 'white',
  [65536]: 'white',
  [131072]: 'white'
}

const contrastColors: { [key: number]: string } = {
  [2]: 'black',
  [4]: 'black',
  [8]: 'black',
  [16]: 'black',
  [32]: 'black',
  [64]: 'black',
  [128]: 'black',
  [256]: 'black',
  [512]: 'black',
  [1024]: 'black',
  [2048]: 'black',
  [4096]: 'black',
  [8192]: 'white',
  [16384]: 'white',
  [32768]: 'white',
  [65536]: 'white',
  [131072]: 'white'
}

const getBackgroundColour = (value: number) => {
  if (value < 0) {
    return 'Tan'
  }
  return backgroundColors[value] || 'deeppink'
}

const getTextColour = (value: number) => {
  if (value < 0) {
    return 'black'
  }

  return textColors[value] || 'white'
}

const getContrastColour = (value: number) => {
  if (value < 0) {
    return 'black'
  }

  return contrastColors[value] || 'black'
}

Devvit.configure({
  redditAPI: true,
  redis: true,
})

Devvit.addMenuItem({
  label: 'New custom post',
  location: 'subreddit',
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit()
    await reddit.submitPost({
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading Tjueførtiåtte...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Hello Custom Post`,
      subredditName: subreddit.name,
    })

    ui.showToast({
      text: `Successfully created a shitty 2048 custom post!`,
      appearance: 'success',
    })
  },
})

Devvit.addCustomPostType({
  name: 'TwentyFortyEight',
  height: 'tall',
  render: (context) => {
    const { useState, redis, reddit } = context
    const game = new TwentyFortyEightGame(context)
    game.setup()

    const currentUser = useState(async () => {
      const user = await reddit.getCurrentUser()
      return user.username
    })

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
        redis.hset('highScores', { [currentUser[0]]: score })
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
  },
})

Devvit.addTrigger({
  events: ['AppUpgrade', 'AppInstall'],
  async onEvent(_, context) {
    const { redis } = context
    const exists = await redis.hgetall('highScores')
    if (!exists || Object.keys(exists).length === 0) {
      await redis.hset('highScores', { 'devvit': '2048' })
    }
  }
})

export default Devvit
