import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/user.routes';
import employeeRoutes from './routes/employee.routes';
import licenseRoutes from './routes/license.routes';
import hardwareTransferRoutes from './routes/hardwareTransfer.routes';
import isoRoutes from './routes/iso.routes';
import networkEquipmentRoutes from './routes/network-equipment.routes';
import supportRoutes from './routes/support.routes';
import newHardwareRoutes from "./routes/newhardware.routes";
import furntureRoutes from './routes/furniture.routes';
import documentRoutes from './routes/document.routes';
import auditRoutes from './routes/audit.routes';
import simRoutes from './routes/sim.routes';
import softwareRoutes from './routes/software.routes';
import fileUploadRoutes from './routes/file-upload.routes';
import propertyRoutes from './routes/property.routes';
import vehicleRoutes from './routes/vehicle.routes';
import equipmentRoutes from './routes/equipment.routes';
import bankAccountRoutes from './routes/bankAccount.routes';
import telexTransferRoutes from './routes/telex-transfer.routes';
import bankBalanceRoutes from './routes/bankBalance.routes';
import forecastRoutes from './routes/forecast.routes';
import chequeRoutes from './routes/cheque.routes';
import payeeRoutes from './routes/payee.routes';
import leavePolicyRoutes from './routes/leave-policy.routes';
import leaveBalanceRoutes from './routes/leave-balance.routes';
import leaveApplicationRoutes from './routes/leave-application.routes';
import attendancePolicyRoutes from './routes/attendance-policy.routes';
import payrollCompensationRoutes from './routes/payroll-compensation.routes';
import attendanceRoutes from './routes/attendance.routes';
import monthlyPayrollRoutes from './routes/monthly-payroll.routes';
import bonusRoutes from './routes/bonus.routes';
import incentiveRoutes from './routes/incentive.routes';
import roleRoutes from './routes/role.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import activityLogRoutes from './routes/activity-log.routes';
import { errorMiddleware } from './middlewares/error.middleware';

import { config } from './config/config'; 
const app = express();

// CORS middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Public Routes (no authentication required)
app.use('/api/auth', authRoutes);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use("/api/iso", isoRoutes);
app.use("/api/network-equipment", networkEquipmentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/new-hardware", newHardwareRoutes);    
app.use('/api/licenses', licenseRoutes);
app.use('/api/hardware-transfer', hardwareTransferRoutes);
app.use('/api/furnitures', furntureRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/sims', simRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/file-upload', fileUploadRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/telex-transfers', telexTransferRoutes);
app.use('/api/bank-balances', bankBalanceRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/cheques', chequeRoutes);
app.use('/api/payees', payeeRoutes);
app.use('/api/leave-policies', leavePolicyRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/leave-applications', leaveApplicationRoutes);
app.use('/api/attendance-policies', attendancePolicyRoutes);
app.use('/api/payroll-compensation', payrollCompensationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/monthly-payroll', monthlyPayrollRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/incentives', incentiveRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Error Handler
app.use(errorMiddleware);

export default app;
