import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

/**
 * Generates a cryptographically secure random salt string.
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Computes a secure PBKDF2 hash of a PIN or Password using the provided salt.
 */
export function hashCredential(credential: string, salt: string): string {
  return crypto
    .pbkdf2Sync(credential.trim(), salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");
}

/**
 * Secure timing-safe verification of credential against stored hash.
 */
export function verifyCredential(
  credential: string,
  salt: string,
  storedHash: string
): boolean {
  if (!credential || !salt || !storedHash) return false;
  try {
    const computedHash = hashCredential(credential, salt);
    const storedBuf = Buffer.from(storedHash, "hex");
    const computedBuf = Buffer.from(computedHash, "hex");

    if (storedBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(storedBuf, computedBuf);
  } catch {
    return false;
  }
}

/**
 * Generates a session unlock token with an expiration timestamp.
 */
export function generateUnlockSessionToken(userId: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000; // 4 hours unlock session
  const payload = `${userId}:${expiresAt}`;
  const secret = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "nexus-content-lock-secret-key-32ch";
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");
  return { token, expiresAt };
}

/**
 * Validates a session unlock token.
 */
export function validateUnlockSessionToken(token: string, userId: string): boolean {
  if (!token || !userId) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [tokenUserId, expiresAtStr, signature] = decoded.split(":");
    if (!tokenUserId || !expiresAtStr || !signature) return false;
    if (tokenUserId !== userId) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

    const payload = `${tokenUserId}:${expiresAtStr}`;
    const secret = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "nexus-content-lock-secret-key-32ch";
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const expectedBuf = Buffer.from(expectedSig, "hex");
    const actualBuf = Buffer.from(signature, "hex");

    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}
