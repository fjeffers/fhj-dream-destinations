/**
 * AES-256-GCM encryption utility — server-side only.
 *
 * NEVER import this in client components ('use client').
 * Passwords are encrypted before leaving this module and
 * decrypted only here. The raw key never touches the client.
 *
 * Format stored in DB:  iv_hex:tag_hex:ciphertext_hex
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM  = 'aes-256-gcm'
const KEY_BYTES  = 32   // 256-bit key
const IV_BYTES   = 16   // 128-bit IV (standard for GCM)
const TAG_BYTES  = 16   // 128-bit auth tag
// Static salt — the secret is the env var; salt just ensures the scrypt
// output is domain-separated from any other use of the same key material.
const SALT       = 'fhj-loyalty-v1'
const SEPARATOR  = ':'

/** Derive a 256-bit key from the LOYALTY_ENCRYPTION_KEY env var via scrypt. */
function getKey(): Buffer {
  const secret = process.env.LOYALTY_ENCRYPTION_KEY
  if (!secret || secret.length < 32) {
    throw new Error(
      'LOYALTY_ENCRYPTION_KEY env var is missing or too short (min 32 chars). ' +
      'Set it in Vercel → Settings → Environment Variables.'
    )
  }
  return scryptSync(secret, SALT, KEY_BYTES)
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns an opaque string safe to store in the database.
 * Returns '' for empty/null input.
 */
export function encrypt(plaintext: string | null | undefined): string {
  if (!plaintext) return ''
  const key = getKey()
  const iv  = randomBytes(IV_BYTES)

  const cipher    = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag       = cipher.getAuthTag() // GCM auth tag — tamper detection

  return [
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted.toString('hex'),
  ].join(SEPARATOR)
}

/**
 * Decrypt a value produced by encrypt().
 * Returns '' for empty/null/malformed input.
 * Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(ciphertext: string | null | undefined): string {
  if (!ciphertext) return ''

  const parts = ciphertext.split(SEPARATOR)
  if (parts.length !== 3) return '' // not our format — silently skip

  const [ivHex, tagHex, encryptedHex] = parts
  const key       = getKey()
  const iv        = Buffer.from(ivHex, 'hex')
  const tag       = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) return ''

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

/** Convenience: only encrypt if the value is non-empty, else return null. */
export function encryptOrNull(value: string | null | undefined): string | null {
  const result = encrypt(value)
  return result || null
}

/** Convenience: only decrypt if the value is non-empty, else return null. */
export function decryptOrNull(value: string | null | undefined): string | null {
  const result = decrypt(value)
  return result || null
}
