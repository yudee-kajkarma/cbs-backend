import 'reflect-metadata';
import app from './app';
import { connectToDatabase } from './config/database';
import { config } from './config/config';
import { LeaveStatusCronService } from './services/leave-status-cron.service';
import { LeavePolicyService } from './services/leave-policy.service';

(async () => {
  await connectToDatabase();
  
  // Initialize default leave policy if not exists
  await LeavePolicyService.ensureDefaultPolicy();
  
  // Start cron jobs
  LeaveStatusCronService.startYearlyLeaveBalanceInitializer();
  LeaveStatusCronService.startLeaveStatusUpdater();
  
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });
})();
