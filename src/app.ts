import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
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
import forecastRoutes from './routes/forecast.routes';
import { errorMiddleware } from './middlewares/error.middleware';

import { config } from './config/config'; 
const app = express();

// CORS middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
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
app.use('/api/forecasts', forecastRoutes);

// Error Handler
app.use(errorMiddleware);

export default app;
