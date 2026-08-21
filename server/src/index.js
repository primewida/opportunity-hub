import app from './app.js';
import config from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`\n🚀 OpportunityHub API running on http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔧 Environment: ${config.nodeEnv}\n`);

  // Asynchronously synchronize live opportunities and jobs on startup
  setTimeout(async () => {
    try {
      const { scrapeLiveFeeds } = await import('./services/scraper.service.js');
      await scrapeLiveFeeds();
    } catch (err) {
      console.warn('Background startup web scraping notice:', err.message);
    }
  }, 3000);

  // Recurring automated synchronization every 6 hours
  setInterval(async () => {
    try {
      console.log('⏰ Running scheduled 6-hour opportunities and jobs scraper...');
      const { scrapeLiveFeeds } = await import('./services/scraper.service.js');
      await scrapeLiveFeeds();
    } catch (err) {
      console.warn('Scheduled scraping notice:', err.message);
    }
  }, 6 * 60 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
