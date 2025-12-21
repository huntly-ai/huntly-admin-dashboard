import bcrypt from "bcrypt"
import { SignJWT, jwtVerify } from "jose"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashApiKey, hasPermission, ApiPermission } from "@/lib/api-keys"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not configured")
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(
  payload: { userId: string; email: string; memberId?: string | null },
  expirationTime: string = "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string; memberId?: string | null }
  } catch {
    return null
  }
}

export interface AuthResult {
  isValid: boolean
  user?: { userId: string; email: string; memberId?: string | null }
  apiKey?: {
    id: string
    name: string
    permissions: string[]
    internalProjectId: string | null
  }
  authType?: "jwt" | "api-key"
}

export async function verifyAuth(
  request: NextRequest,
  requiredPermission?: ApiPermission
): Promise<AuthResult> {
  try {
    // First, check for API Key in header
    const apiKeyHeader = request.headers.get("X-API-Key")

    if (apiKeyHeader) {
      return verifyApiKeyAuth(apiKeyHeader, requiredPermission)
    }

    // Fallback to JWT cookie auth
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return { isValid: false }
    }

    const user = await verifyToken(token)

    if (!user) {
      return { isValid: false }
    }

    return { isValid: true, user, authType: "jwt" }
  } catch {
    return { isValid: false }
  }
}

/**
 * Verify API Key authentication
 */
async function verifyApiKeyAuth(
  apiKey: string,
  requiredPermission?: ApiPermission
): Promise<AuthResult> {
  try {
    // Hash the provided key
    const keyHash = hashApiKey(apiKey)

    // Find the API key in the database
    const storedKey = await prisma.apiKey.findFirst({
      where: {
        key: keyHash,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        internalProjectId: true,
        expiresAt: true,
      },
    })

    if (!storedKey) {
      return { isValid: false }
    }

    // Check expiration
    if (storedKey.expiresAt && new Date() > storedKey.expiresAt) {
      return { isValid: false }
    }

    // Check permission if required
    if (requiredPermission && !hasPermission(storedKey.permissions, requiredPermission)) {
      return { isValid: false }
    }

    // Update last used timestamp (async, don't await)
    prisma.apiKey
      .update({
        where: { id: storedKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {
        // Ignore errors updating lastUsedAt
      })

    return {
      isValid: true,
      apiKey: storedKey,
      authType: "api-key",
    }
  } catch {
    return { isValid: false }
  }
}

/**
 * Check if the authenticated request has access to a specific internal project
 * (for API keys scoped to a project)
 */
export function hasProjectAccess(auth: AuthResult, projectId: string): boolean {
  // JWT auth has full access
  if (auth.authType === "jwt") {
    return true
  }

  // API key with no project restriction has access to all
  if (auth.apiKey && !auth.apiKey.internalProjectId) {
    return true
  }

  // API key restricted to specific project
  if (auth.apiKey?.internalProjectId === projectId) {
    return true
  }

  return false
}

