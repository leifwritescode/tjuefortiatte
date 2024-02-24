import { Context, Devvit, MenuItem, MenuItemOnPressEvent } from "@devvit/public-api"
import { Preview } from "./Components.js"

type MenuItemOnPressHandler = (event: MenuItemOnPressEvent, context: Context) => Promise<void>

const generateManualGameMenuItemHandler: MenuItemOnPressHandler = async (_, context) => {
  const { reddit, ui } = context
  const subreddit = await reddit.getCurrentSubreddit()
  await reddit.submitPost({
    preview: <Preview />,
    title: `Manual Challenge ${new Date().toDateString()}`,
    subredditName: subreddit.name,
  })

  ui.showToast({
    text: `Success! A manual challenge has been posted to ${subreddit.name}!`,
    appearance: 'success',
  })
}

export const generateManualGameMenuItem: MenuItem = {
  label: 'Manual Challenge',
  location: 'subreddit',
  onPress: generateManualGameMenuItemHandler,
}
