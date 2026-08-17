import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getAvatarMediaUrl } from "@/lib/avatar-url";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

let client: S3Client | null = null;

function getR2Client() {
  if (client) return client;

  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");

  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return client;
}

function getBucket() {
  return requiredEnv("R2_BUCKET_NAME");
}

export async function uploadToR2(input: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const bucket = getBucket();
  const r2 = getR2Client();

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return getAvatarMediaUrl(input.key);
}

export async function getFromR2(key: string) {
  const bucket = getBucket();
  const r2 = getR2Client();

  return r2.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function deleteFromR2(key: string) {
  const bucket = getBucket();
  const r2 = getR2Client();

  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
