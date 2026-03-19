export interface IConfig {
  env: string;
  port: number;
  mongodb: {
    uri: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3BucketName: string;
    urlExpiry: number;
  };
  currencyApi: {
    apiKey: string;
    baseUrl: string;
  };
  attendance: {
    allowedIpRanges: string[];
    allowLocalhost: boolean;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromAddress: string;
  };
}
