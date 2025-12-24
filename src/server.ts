import 'reflect-metadata';
import app from './app';
import { connectToDatabase } from './config/database';
import { config } from './config/config';
import { LeaveStatusCronService } from './services/leave-status-cron.service';
import { SSEService } from './services/sse.service';

(async () => {
  await connectToDatabase();
  
  // Initialize SSE Service
  SSEService.initialize();
  console.log('SSE Service initialized');
  
  // Start cron jobs
  LeaveStatusCronService.startYearlyLeaveBalanceInitializer();
  LeaveStatusCronService.startLeaveStatusUpdater();
  
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });

  // Cleanup on shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    SSEService.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    SSEService.cleanup();
    process.exit(0);
  });
})();
