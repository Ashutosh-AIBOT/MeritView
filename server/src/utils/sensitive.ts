import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encrypt(text: string, key: Buffer): { encrypted: Buffer; iv: Buffer; tag: Buffer } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('meritview-brief'));
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { encrypted, iv, tag };
}

export function decrypt(encrypted: Buffer, iv: Buffer, tag: Buffer, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from('meritview-brief'));
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}
