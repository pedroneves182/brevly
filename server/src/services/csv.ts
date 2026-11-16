import { randomUUID } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Link } from '../db/types.js'
import { getR2Config } from '../config.js'

function escapeCsv(value: string | number | Date) {
  const text = value instanceof Date ? value.toISOString() : String(value)
  return '"' + text.replaceAll('"', '""') + '"'
}

export function createLinksCsv(rows: Link[]) {
  const header = ['Original URL', 'Short URL', 'Access Count', 'Created At']
  const data = rows.map((row) => [row.originalUrl, row.shortUrl, row.accessCount, row.createdAt])
  return [header, ...data].map((columns) => columns.map(escapeCsv).join(',')).join('\r\n')
}

export async function uploadLinksCsv(csv: string) {
  const config = getR2Config()
  const objectKey = 'links-' + randomUUID() + '.csv'
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + config.accountId + '.r2.cloudflarestorage.com',
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  try {
    await s3.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: '\uFEFF' + csv,
      ContentType: 'text/csv; charset=utf-8',
      ContentDisposition: 'attachment; filename="links.csv"',
      CacheControl: 'public, max-age=31536000, immutable',
    }))
  } finally {
    s3.destroy()
  }

  return config.publicUrl.replace(/\/$/, '') + '/' + objectKey
}
