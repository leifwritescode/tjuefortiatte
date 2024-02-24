import { Devvit } from '@devvit/public-api'
import { generateDailyGameScheduledJob } from './Jobs.js'
import { ensureRedisIsPrimedTrigger } from './Triggers.js'
import { generateManualGameMenuItem } from './MenuItems.js'
import { twentyFortyEightCustomPost } from './CustomPost.js'

Devvit.configure({ redditAPI: true, redis: true })
Devvit.addMenuItem(generateManualGameMenuItem)
Devvit.addTrigger(ensureRedisIsPrimedTrigger);
Devvit.addSchedulerJob(generateDailyGameScheduledJob);
Devvit.addCustomPostType(twentyFortyEightCustomPost)

export default Devvit
