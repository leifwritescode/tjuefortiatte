import { Devvit } from "@devvit/public-api";
import { TwentyFortyEightGame } from "./TwentyFortyEightGame.js";

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

interface CellProps {
  x: number
  y: number
  game: TwentyFortyEightGame
  value: number
}

export const Cell = (props: CellProps) => {
  const { value, game, x, y } = props;
  return (
    <vstack
      width="48px"
      height="48px"
      cornerRadius='small'
      backgroundColor={getBackgroundColour(value)}
      alignment="middle"
      border={game.isLastSpawned({ x, y }) ? 'thick' : 'none'}
      borderColor={getContrastColour(value)}>
      <text
        style="heading"
        size="large"
        alignment='center'
        color={getTextColour(value)}
        weight='bold'>
        {value === -1 ? '' : value}
      </text>
    </vstack>
  )
}

interface GameBoardProps {
  game: TwentyFortyEightGame
}

const f = (x: TwentyFortyEightGame) => {
  x.board
}

export const GameBoard = (props: GameBoardProps) => {
  const { game } = props;
  return (
    <vstack backgroundColor='Burlywood' gap='small' alignment='middle' padding='small' cornerRadius='medium'>
      { game.boardmap((row, y) => (
        <hstack gap="small" alignment="middle">
          { row.map((cell, x) => (
            <Cell x={x} y={y} game={game} value={cell} />
          ))}
        </hstack>
      )) }
    </vstack>
  )
}

interface ScoreBoxProps {
  title: string
  score: number
}

export const ScoreBox = (props: ScoreBoxProps) => {
  const { title, score } = props;
  return (
    <vstack backgroundColor='Sienna' cornerRadius='small' borderColor='SaddleBrown' padding='small'>
      <text color='white' weight='bold' alignment='middle'>{title}</text>
      <text color='white' weight='bold' alignment='middle'>{score}</text>
    </vstack>
  )
}

interface ControlBoxProps {
  game: TwentyFortyEightGame
}

export const ControlBox = (props: ControlBoxProps) => {
  const { game } = props;
  return (
    <hstack grow alignment='middle center' gap='small'>
      <button icon='back' size='large' appearance='secondary' onPress={() => game.play('left')}></button>
      <vstack gap='medium'>
        <button icon='up-arrow' size='large' appearance='secondary' onPress={() => game.play('up')}></button>
        <button icon='down-arrow' size='large' appearance='secondary'  onPress={() => game.play('down')}></button>
      </vstack>
      <button icon='forward' size='large' appearance='secondary'  onPress={() => game.play('right')}></button>
    </hstack>
  )
}

export const Preview = () => (
  <vstack padding="medium" cornerRadius="medium">
    <text style="heading" size="medium">
      Loading Tjueførtiåtte...
    </text>
  </vstack>
)
