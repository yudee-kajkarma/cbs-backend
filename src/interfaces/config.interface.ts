export interface IConfig {
  env: string;
  port: number;
  mongodb: {
    uri: string;
  };
  cors: {
    allowedOrigins: string[];
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
}
