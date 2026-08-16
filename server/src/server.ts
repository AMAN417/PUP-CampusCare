import { createApp } from './app.js';
import { config } from './config/environment.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log('====================================================');
  console.log('  🏛️  PUP CampusCare REST API Server Active');
  console.log(`  🚀  Port: ${config.PORT}`);
  console.log(`  🌍  Environment: ${config.NODE_ENV}`);
  console.log(`  🔗  Base URL: http://localhost:${config.PORT}${config.API_PREFIX}`);
  console.log(`  🩺  Health: http://localhost:${config.PORT}${config.API_PREFIX}/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down PUP CampusCare server gracefully...`);
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;
