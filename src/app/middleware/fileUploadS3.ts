import AWS from 'aws-sdk';
import fs, { access } from 'fs';

// configure aws 
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

export const uploadFileToS3 = async (file: any) => {
    const params  = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}_${file.originalname}`,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype
    } as any;
  
    return await s3.upload(params).promise()
  }