import dotenv from 'dotenv';
import { IConfig } from '../interfaces/config.interface';

dotenv.config();

export const config: IConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:30000/company-documents',
  },
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'],
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'cbs-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3BucketName: process.env.S3_BUCKET_NAME || '',
    urlExpiry: parseInt(process.env.S3_URL_EXPIRY || '900', 10),
  },
  currencyApi: {
    apiKey: process.env.CURRENCY_API_KEY || '106f5e7fc36d4ac4df539713',
    baseUrl: process.env.CURRENCY_API_BASE_URL || 'https://v6.exchangerate-api.com/v6',
  },
  attendance: {
    allowedIpRanges: process.env.COMPANY_NETWORK_IP_RANGES
      ? process.env.COMPANY_NETWORK_IP_RANGES.split(',').map(ip => ip.trim())
      : [],
    allowLocalhost: process.env.NODE_ENV === 'development',
  },
};
