import bcrypt from "bcrypt"
import { SignJWT, jwtVerify } from "jose"
import { NextRequest } from "next/server"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "huntly-secret-key-change-in-production"
)

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
  } catch (error) {
    return null
  }
}

export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean
  user?: { userId: string; email: string; memberId?: string | null }
}> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return { isValid: false }
    }

    const user = await verifyToken(token)

    if (!user) {
      return { isValid: false }
    }

    return { isValid: true, user }
  } catch (error) {
    return { isValid: false }
  }
}

