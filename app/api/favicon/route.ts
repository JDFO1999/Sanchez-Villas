import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })

    if (record?.data) {
      const parsed = JSON.parse(record.data)
      const iconSource: string | undefined =
        parsed.faviconUrl || parsed.logoUrl || parsed.logoUrlDark

      if (iconSource && typeof iconSource === "string") {
        // Caso 1: Data URI (data:image/png;base64,...)
        const dataMatch = iconSource.match(/^data:([^;]+);base64,(.+)$/)
        if (dataMatch) {
          const mimeType = dataMatch[1] || "image/png"
          const base64Data = dataMatch[2]
          const buffer = Buffer.from(base64Data, "base64")
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          })
        }

        // Caso 2: Ruta local en /uploads o /public
        if (iconSource.startsWith("/")) {
          const cleanRel = iconSource.replace(/^\/api\/uploads\//, "uploads/").replace(/^\//, "")
          const candidatePaths = [
            path.join(process.cwd(), "public", cleanRel),
            path.join(process.cwd(), cleanRel),
          ]
          for (const p of candidatePaths) {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
              const fileBuf = fs.readFileSync(p)
              const ext = path.extname(p).toLowerCase()
              const mime =
                ext === ".png"
                  ? "image/png"
                  : ext === ".svg"
                  ? "image/svg+xml"
                  : ext === ".jpg" || ext === ".jpeg"
                  ? "image/jpeg"
                  : ext === ".webp"
                  ? "image/webp"
                  : "image/x-icon"
              return new NextResponse(fileBuf, {
                status: 200,
                headers: {
                  "Content-Type": mime,
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                },
              })
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error serving dynamic favicon:", err)
  }

  // Fallback a default-favicon.ico
  try {
    const fallbackPath = path.join(process.cwd(), "public", "default-favicon.ico")
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath)
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }
  } catch (_) {}

  return new NextResponse(null, { status: 404 })
}
