import { Devvit } from '@devvit/public-api';
import { TwentyFortyEightGame } from './App.js';


const colors: { [key: number]: string } = {
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
}

const getColor = (value: number) => {
  if (value < 0) {
    return 'lightgrey';
  }
  return colors[value] || 'deeppink';
}

// Define what packages you want to use here
// Others include:
// kvStore: a simple key value store for persisting data across sessions within this installation
// media: used for importing and posting images
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
});

/*
 * Use a menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New custom post',
  location: 'subreddit',
  /*
   * _ tells Typescript we don't care about the first argument
   * The second argument is a Context object--here we use object destructuring to
   * pull just the parts we need. The code below is equivalient
   * to using context.reddit and context.ui
   */
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();

    /*
     * Submits the custom post to the specified subreddit
     */
    await reddit.submitPost({
      // This will show while your custom post is loading
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading custom post hello world...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Hello Custom Post`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Hello World custom post!`,
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'TwentyFortyEight',
  /**
   * You can optionally set the height of your post between 'regular' (320px) and 'tall' (512px)
   */
  height: 'regular',
  /*
   * The render function defines the custom post layout during rendering.
   * It is called on load and after every user interaction (e.g. button click)
   *
   * Here, we simply use the context object directly, as opposed to how we
   * handled it above in `onPress`.
   */
  render: (context) => {
    const game = new TwentyFortyEightGame(context);
    game.setup();

    if (game.isGameOver()) {
      return (
        <vstack grow alignment='middle'>
          <hstack grow alignment='middle'>
            <vstack gap='small'>
              <text>Game Over!</text>
              <text>Your Score: {game.getScore()}</text>
              <button onPress={() => game.reset()}>Just One More?</button>
            </vstack>
          </hstack>
        </vstack>
      )
    } else {
      return (
        <vstack padding="medium" cornerRadius="medium" gap="small" alignment="middle">
          <hstack gap='small'>
            <text grow alignment='center'>Score: {game.getScore()}</text>
            <button onPress={() => game.reset()}>Reset</button>
          </hstack>
          <vstack>
            { game.getRows().map((row, y) => (
              <hstack gap="small" alignment="middle">
                { row.map((cell, x) => (
                  <vstack
                    width="48px"
                    height="48px"
                    cornerRadius="small"
                    backgroundColor={getColor(cell)}
                    borderColor='black'
                    alignment="middle"
                  >
                    <text style="heading" size="medium" alignment='center'>
                      {cell === -1 ? '' : cell}
                    </text>
                  </vstack>
                ))}
              </hstack>
            )) }
          </vstack>
          <hstack>
            <button onPress={() => game.testPlay('left')}>Left</button>
            <button onPress={() => game.testPlay('right')}>Right</button>
            <button onPress={() => game.testPlay('up')}>Up</button>
            <button onPress={() => game.testPlay('down')}>Down</button>
          </hstack>
        </vstack>
      );
    }
  },
});

export default Devvit;
