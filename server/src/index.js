import app from './app.js';
import config from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`\n🚀 OpportunityHub API running on http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔧 Environment: ${config.nodeEnv}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
