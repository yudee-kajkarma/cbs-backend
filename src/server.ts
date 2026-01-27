import 'reflect-metadata';
import app from './app';
import { connectToDatabase, closeDatabase } from './config/database';
import { closeAdminConnection } from './utils/admin-connection';
import { config } from './config/config';
import { LeaveStatusCronService } from './services/leave-status-cron.service';
import { PayrollCronService } from './services/payroll-cron.service';
import { SSEService } from './services/sse.service';

(async () => {
  await connectToDatabase();
  
  // Initialize SSE Service
  SSEService.initialize();
  console.log('SSE Service initialized');
  
  // Start cron jobs
  LeaveStatusCronService.startYearlyLeaveBalanceInitializer();
  LeaveStatusCronService.startLeaveStatusUpdater();
  PayrollCronService.startMonthlyPayrollGenerator();
  
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    try {
      // Cleanup SSE connections
      SSEService.cleanup();
      console.log('✓ SSE connections closed');
      
      // Close all database connections (base + all tenants)
      await closeDatabase();
      console.log('✓ Database connections closed');
      
      // Close admin database connection
      await closeAdminConnection();
      
      console.log('✓ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})();
