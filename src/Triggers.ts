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
