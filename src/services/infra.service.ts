import AWS from 'aws-sdk';
import { config } from '../config/config';
import { ErrorHandler } from '../utils/error-handler.util';
import { throwError, isCustomError } from '../utils/errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

/**
 * Infrastructure Service
 * Handles provisioning of cloud resources for tenants
 */
export class InfraService {
  /**
   * Provision S3 bucket for tenant
   * Creates a dedicated S3 bucket with proper security configuration
   * @param tenantRefId - Tenant reference ID
   */
  static async provisionS3ForTenant(tenantRefId: string): Promise<void> {
    try {
      // Validate AWS credentials are configured
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        console.warn(INFO_MESSAGES.INFRASTRUCTURE.AWS_CREDENTIALS_NOT_CONFIGURED);
        return;
      }

      const env = config.env; // 'development', 'staging', 'production'
      const bucketName = `cbs-${tenantRefId.toLowerCase()}`;
      
      const s3 = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });
      
      // Check if bucket exists
      try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log(`✓ ${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_EXISTS}: ${bucketName}`);
        return;
      } catch (error: any) {
        if (error.statusCode !== 404 && error.code !== 'NotFound') {
          throw error;
        }
      }
      
      // Create bucket
      console.log(`${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_CREATING}: ${bucketName}`);
      
      const createBucketParams: AWS.S3.CreateBucketRequest = {
        Bucket: bucketName,
      };
      
      // Add LocationConstraint only for regions other than us-east-1
      if (config.aws.region !== 'us-east-1') {
        createBucketParams.CreateBucketConfiguration = {
          LocationConstraint: config.aws.region,
        };
      }
      
      await s3.createBucket(createBucketParams).promise();
      console.log(`✓ ${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_CREATED}: ${bucketName}`);
      
      // Configure public access block (security)
      await s3.putPublicAccessBlock({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      }).promise();
      
      // Set bucket policy (allow public read for /public/ folder only)
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowPublicReadAccess',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/public/*`,
          },
        ],
      };
      
      await s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy),
      }).promise();
      
      // Enable CORS
      await s3.putBucketCors({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['PUT', 'POST', 'GET', 'DELETE'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
            },
          ],
        },
      }).promise();
      
      console.log(`✓ ${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_CONFIGURED}: ${bucketName}`);
    } catch (error) {
      if (isCustomError(error)) {
        throw error;
      }
      ErrorHandler.handleServiceError(error, {
        serviceName: 'InfraService',
        method: 'provisionS3ForTenant',
        tenantRefId,
      });
    }
  }

  /**
   * Delete S3 bucket for tenant (USE WITH CAUTION)
   * @param tenantRefId - Tenant reference ID
   */
  static async deleteS3ForTenant(tenantRefId: string): Promise<void> {
    try {
      // Validate AWS credentials are configured
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        console.warn(INFO_MESSAGES.INFRASTRUCTURE.AWS_CREDENTIALS_NOT_CONFIGURED_DELETE);
        return;
      }

      const env = config.env;
      const bucketName = `cbs-${tenantRefId.toLowerCase()}`;
      
      const s3 = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });
      
      // Check if bucket exists
      try {
        await s3.headBucket({ Bucket: bucketName }).promise();
      } catch (error: any) {
        if (error.statusCode === 404 || error.code === 'NotFound') {
          console.log(`${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_NOT_EXISTS}: ${bucketName}`);
          return;
        }
        throw error;
      }
      
      console.log(`${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_DELETING}: ${bucketName}`);
      
      // List and delete all objects in bucket
      let isTruncated = true;
      let continuationToken: string | undefined;
      
      while (isTruncated) {
        const listParams: AWS.S3.ListObjectsV2Request = {
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        };
        
        const listedObjects = await s3.listObjectsV2(listParams).promise();
        
        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          const deleteParams: AWS.S3.DeleteObjectsRequest = {
            Bucket: bucketName,
            Delete: {
              Objects: listedObjects.Contents.map((item: AWS.S3.Object) => ({ Key: item.Key! })),
            },
          };
          
          await s3.deleteObjects(deleteParams).promise();
        }
        
        isTruncated = listedObjects.IsTruncated || false;
        continuationToken = listedObjects.NextContinuationToken;
      }
      
      // Delete bucket
      await s3.deleteBucket({ Bucket: bucketName }).promise();
      console.log(`✓ ${INFO_MESSAGES.INFRASTRUCTURE.S3_BUCKET_DELETED}: ${bucketName}`);
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: 'InfraService',
        method: 'deleteS3ForTenant',
        tenantRefId,
      });
    }
  }
}
