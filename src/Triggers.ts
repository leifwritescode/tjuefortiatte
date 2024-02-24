import { MultiTriggerDefinition } from "@devvit/public-api";

export const ensureRedisIsPrimedTrigger: MultiTriggerDefinition<"AppInstall" | "AppUpgrade"> = {
  events: ['AppUpgrade', 'AppInstall'],
  async onEvent(_, context) {
    const { redis } = context
    const exists = await redis.hgetall('highScores')
    if (!exists || Object.keys(exists).length === 0) {
      await redis.hset('highScores', { 'devvit': '2048' })
    }
  }
}

export const ensureChallengeGenerationJobIsRunningTrigger: MultiTriggerDefinition<"AppInstall" | "AppUpgrade"> = {
  events: ['AppUpgrade', 'AppInstall'],
  async onEvent(_, context) {
    const { scheduler } = context

    // cancel all of the existing jobs
    const jobs = await scheduler.listJobs()
    const cancellations = jobs.map(async job => {
      await scheduler.cancelJob(job.id)
    })
    await Promise.all(cancellations)

    // and reschedule them
    await scheduler.runJob({
      name: 'generateDailyGame',
      cron: "0 0 * * *"
    })
  }
}
