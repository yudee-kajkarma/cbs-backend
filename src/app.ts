import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

import licenseRoutes from './routes/license.routes';
// import { errorHandler } from './middlewares/error.middleware';
import hardwareTransferRoutes from './routes/hardwareTransfer.routes';
import isoRoutes from './routes/iso.routes';
import networkEquipmentRoutes from './routes/network-equipment.routes';
import supportRoutes from './routes/support.routes';

import newHardwareRoutes from "./routes/newhardware.routes";
import furntureRoutes from './routes/furniture.routes';
dotenv.config();
// import documnentRoutes from './routes/document.routes'; 
const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => res.json({ ok: true }));
app.use("/api/iso", isoRoutes);

// Routes
app.use('/api/licenses', licenseRoutes);

app.use('/api/hardware-transfer', hardwareTransferRoutes);
// app.use('/api/furnitures', furntureRoutes);
// app.use(errorHandler);

export default app;
