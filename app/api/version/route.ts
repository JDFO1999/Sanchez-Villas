import { NextResponse } from "next/server"

// Generado al iniciar el servidor / nuevo despliegue
const DEPLOYMENT_TIMESTAMP = Date.now().toString()
const APP_VERSION = process.env.npm_package_version || "1.0.0"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      buildId: DEPLOYMENT_TIMESTAMP,
      appName: "MaximumAPP",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  )
}
