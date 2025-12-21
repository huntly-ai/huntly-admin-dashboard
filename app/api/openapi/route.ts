import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

// Cache the spec in memory
let cachedSpec: object | null = null

export async function GET() {
  try {
    // Return cached spec if available (in production)
    if (cachedSpec && process.env.NODE_ENV === "production") {
      return NextResponse.json(cachedSpec, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Read the OpenAPI spec from the public directory
    const specPath = join(process.cwd(), "public", "api", "openapi.json")
    const specContent = readFileSync(specPath, "utf-8")
    const spec = JSON.parse(specContent)

    // Cache for production
    if (process.env.NODE_ENV === "production") {
      cachedSpec = spec
    }

    return NextResponse.json(spec, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error reading OpenAPI spec:", error)
    return NextResponse.json(
      { error: "Failed to load API specification" },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
