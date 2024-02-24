import { Devvit } from '@devvit/public-api'
import { generateDailyGameScheduledJob } from './Jobs.js'
import { ensureChallengeGenerationJobIsRunningTrigger, ensureRedisIsPrimedTrigger } from './Triggers.js'
import { generateManualGameMenuItem } from './MenuItems.js'
import { twentyFortyEightCustomPost } from './CustomPost.js'

Devvit.configure({ redditAPI: true, redis: true })

Devvit.addCustomPostType(twentyFortyEightCustomPost)

Devvit.addMenuItem(generateManualGameMenuItem)

Devvit.addSchedulerJob(generateDailyGameScheduledJob)

Devvit.addTrigger(ensureRedisIsPrimedTrigger)
Devvit.addTrigger(ensureChallengeGenerationJobIsRunningTrigger)

export default Devvit
