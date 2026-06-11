import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

function getClient() {
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 environment variables not configured")
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })

  return { client, bucket }
}

export async function getPresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const { client, bucket } = getClient()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn })
}

export async function uploadFromWorker(key: string, body: Uint8Array, contentType: string): Promise<void> {
  const { client, bucket } = getClient()
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }))
}

export async function getFile(key: string): Promise<{ body: Uint8Array; contentType: string }> {
  const { client, bucket } = getClient()
  const result = await client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }))
  if (!result.Body) {
    throw new Error(`R2 object body is empty for key: ${key}`)
  }
  const body = await result.Body.transformToByteArray()
  return { body, contentType: result.ContentType ?? "application/octet-stream" }
}

export async function deleteFile(key: string): Promise<void> {
  const { client, bucket } = getClient()
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }))
}
