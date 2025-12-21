import crypto from "crypto"

const API_KEY_PREFIX = "hntly_"

/**
 * Generate a new API key
 * Returns both the raw key (to show to user once) and the hash (to store in DB)
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate 32 random bytes = 256 bits of entropy
  const randomBytes = crypto.randomBytes(32)
  const keyBody = randomBytes.toString("base64url")

  // Full key with prefix
  const key = `${API_KEY_PREFIX}${keyBody}`

  // Hash the key for storage
  const hash = hashApiKey(key)

  // Prefix for identification (first 8 chars after the prefix)
  const prefix = `${API_KEY_PREFIX}${keyBody.substring(0, 8)}`

  return { key, hash, prefix }
}

/**
 * Hash an API key for storage/comparison
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

/**
 * Verify an API key against a stored hash
 */
export function verifyApiKey(key: string, storedHash: string): boolean {
  const hash = hashApiKey(key)
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash))
}

/**
 * Available permissions for API keys
 */
export const API_PERMISSIONS = {
  // Transactions
  "transactions:read": "Read transactions",
  "transactions:write": "Create/update transactions",
  "transactions:delete": "Delete transactions",

  // Internal Projects
  "internal-projects:read": "Read internal projects",
  "internal-projects:write": "Create/update internal projects",

  // Tasks
  "tasks:read": "Read tasks",
  "tasks:write": "Create/update tasks",
  "tasks:delete": "Delete tasks",

  // Full access
  "full-access": "Full API access",
} as const

export type ApiPermission = keyof typeof API_PERMISSIONS

/**
 * Check if a permission is valid
 */
export function isValidPermission(permission: string): permission is ApiPermission {
  return permission in API_PERMISSIONS
}

/**
 * Check if an API key has a specific permission
 */
export function hasPermission(
  keyPermissions: string[],
  requiredPermission: ApiPermission
): boolean {
  // Full access grants all permissions
  if (keyPermissions.includes("full-access")) {
    return true
  }

  return keyPermissions.includes(requiredPermission)
}
