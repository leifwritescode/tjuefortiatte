import { ScheduledJobHandler, ScheduledJobType } from "@devvit/public-api";

const generateDailyGameScheduledJobHandler: ScheduledJobHandler = async (event, context) => {
  // Generate a new game
}

export const generateDailyGameScheduledJob: ScheduledJobType = {
  name: "Generate Daily Game",
  onRun: generateDailyGameScheduledJobHandler
}
