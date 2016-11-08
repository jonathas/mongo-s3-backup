const AWS = require("aws-sdk");
AWS.config.region = process.env.AWS_REGION;

export const S3Client = new AWS.S3({params: {Bucket: process.env.AWS_BUCKET}});
export default S3Client;
