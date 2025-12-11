import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

import licenseRoutes from './routes/license.routes';
import {errorMiddleware} from './middlewares/error.middleware';
import auditRoutes from './routes/audit.routes';
import isoRoutes from "./routes/iso.routes";
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
app.use('/api/audits', auditRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
