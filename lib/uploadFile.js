// lib/uploadFile.js or utils/uploadFile.js

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION || "us-west-004",
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

/**
 * Upload a file to Backblaze B2
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder prefix (e.g., 'invoices', 'contracts')
 * @returns {Promise<{url: string, filename: string}>}
 */
export async function uploadToB2(file, folder = "uploads") {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
  const fileKey = `${folder}/${filename}`;

  const uploadParams = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
  };

  await b2Client.send(new PutObjectCommand(uploadParams));

  const bucketName = process.env.B2_BUCKET_NAME;
  const endpoint = process.env.B2_ENDPOINT.replace("https://", "");
  const publicUrl = `https://${bucketName}.${endpoint}/${fileKey}`;

  return {
    url: publicUrl,
    filename: file.name,
  };
}
