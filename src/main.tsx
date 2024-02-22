import { Devvit } from '@devvit/public-api'
import { TwentyFortyEightGame } from './App.js'

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
      const currentScore = game.getScore()
      const currentBest = playerBestScore[0]
      if (currentScore > currentBest) {
        const score = `${currentScore}`
        redis.hset('highScores', { [currentUser[0]]: score })
      }

      return (
        <hstack backgroundColor='wheat' grow alignment='middle center'>
          <vstack gap='medium'>
            <text color='black' weight='bold' size='xxlarge' alignment='center'>Game Over!</text>
            <text color='black' weight='bold' size='xlarge' alignment='center'>You scored {game.getScore()} points.</text>
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
              <vstack backgroundColor='Sienna' cornerRadius='small' borderColor='SaddleBrown' padding='small'>
                <text color='white' weight='bold' alignment='middle'>Score</text>
                <text color='white' weight='bold' alignment='middle'>{game.getScore()}</text>
              </vstack>
              <vstack backgroundColor='Sienna' cornerRadius='small' borderColor='SaddleBrown' padding='small'>
                <text color='white' weight='bold' alignment='middle'>Your Best</text>
                <text color='white' weight='bold' alignment='middle'>{playerBestScore[0]}</text>
              </vstack>
              <vstack backgroundColor='Sienna' cornerRadius='small' borderColor='SaddleBrown' padding='small'>
                <text color='white' weight='bold' alignment='middle'>All Time Best</text>
                <text color='white' weight='bold' alignment='middle'>{allTimeHighScore[0]}</text>
              </vstack>
            </hstack>
            <hstack alignment='middle center' grow>
              <spacer grow />
              <vstack backgroundColor='Burlywood' gap='small' alignment='middle' padding='small' cornerRadius='medium'> 
                { game.getRows().map((row, y) => (
                  <hstack gap="small" alignment="middle">
                    { row.map((cell, x) => (
                      <vstack
                        width="48px"
                        height="48px"
                        cornerRadius='small'
                        backgroundColor={getBackgroundColour(cell)}
                        alignment="middle"
                        border={game.isLastSpawned({ x, y }) ? 'thick' : 'none'}
                        borderColor={getContrastColour(cell)}
                      >
                        <text style="heading" size="large" alignment='center' color={getTextColour(cell)} weight='bold'>
                          {cell === -1 ? '' : cell}
                        </text>
                      </vstack>
                    ))}
                  </hstack>
                )) }
              </vstack>
              <spacer grow />
            </hstack>
            <hstack grow alignment='middle center' gap='small'>
              <button icon='back' onPress={() => game.testPlay('left')}></button>
              <vstack gap='medium'>
                <button icon='up-arrow' onPress={() => game.testPlay('up')}></button>
                <button icon='down-arrow' onPress={() => game.testPlay('down')}></button>
              </vstack>
              <button icon='forward' onPress={() => game.testPlay('right')}></button>
            </hstack>
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
