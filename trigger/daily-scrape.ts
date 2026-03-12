import { schedules } from '@trigger.dev/sdk'
import { runScrapeAndProcess } from '@/lib/pipeline'

export const dailyScrape = schedules.task({
  id: 'daily-ai-tools-scrape',
  cron: '0 15 * * *', // 7:00am PST = 15:00 UTC
  machine: { preset: 'small-2x' },
  retry: { maxAttempts: 2 },
  run: async () => {
    const result = await runScrapeAndProcess()
    return result
  },
})
