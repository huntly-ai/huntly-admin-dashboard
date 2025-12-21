"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function ApiDocsPage() {
  useEffect(() => {
    // Initialize SwaggerUI when scripts are loaded
    const initSwagger = () => {
      if (typeof window !== "undefined" && (window as unknown as { SwaggerUIBundle: unknown }).SwaggerUIBundle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SwaggerUIBundle = (window as any).SwaggerUIBundle
        SwaggerUIBundle({
          url: "/api/openapi",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "StandaloneLayout",
          persistAuthorization: true,
        })
      }
    }

    // Check if already loaded
    if ((window as unknown as { SwaggerUIBundle: unknown }).SwaggerUIBundle) {
      initSwagger()
    } else {
      // Wait for script to load
      window.addEventListener("swagger-loaded", initSwagger)
      return () => window.removeEventListener("swagger-loaded", initSwagger)
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"
        onLoad={() => {
          window.dispatchEvent(new Event("swagger-loaded"))
        }}
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"
      />
      <div
        id="swagger-ui"
        style={{
          height: "100vh",
          backgroundColor: "#1a1a1a",
        }}
      />
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        .swagger-ui {
          font-family: system-ui, -apple-system, sans-serif;
        }
        .swagger-ui .topbar {
          background-color: #000;
          padding: 10px 0;
        }
        .swagger-ui .info .title {
          color: #fff;
        }
        .swagger-ui .info .description p {
          color: #a0a0a0;
        }
        .swagger-ui .scheme-container {
          background: #1a1a1a;
        }
        .swagger-ui .opblock-tag {
          color: #fff;
          border-bottom-color: #333;
        }
        .swagger-ui .opblock .opblock-summary-operation-id,
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-path__deprecated {
          color: #fff;
        }
        .swagger-ui section.models {
          border-color: #333;
        }
        .swagger-ui section.models h4 {
          color: #fff;
        }
      `}</style>
    </>
  )
}
