import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import fs from "fs"
import path from "path"
import { generateMaskableIconBuffer, getLatestLogoFilePath } from "@/lib/pwa-icons"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const isAppOrSize = searchParams.has("size") || searchParams.has("apple")
    const isMaskable = searchParams.has("maskable") || searchParams.get("maskable") === "1"
    const requestedSize = parseInt(searchParams.get("size") || "512", 10) || 512

    let iconSource: string | undefined

    try {
      const record = await prisma.systemSetting.findUnique({
        where: { id: "default" },
      })

      if (record?.data) {
        const parsed = JSON.parse(record.data)
        iconSource = isAppOrSize || isMaskable
          ? (parsed.logoUrl || parsed.logoUrlDark || parsed.faviconUrl)
          : (parsed.faviconUrl || parsed.logoUrl || parsed.logoUrlDark)
      }
    } catch (_) {}

    // Si es petición maskable (para PWA splash screen y lanzador Android/iOS)
    if (isMaskable) {
      let srcBuffer: Buffer | null = null

      // Revisar si existe data URI
      if (iconSource && iconSource.startsWith("data:image/")) {
        const base64Data = iconSource.split(",")[1]
        if (base64Data) {
          srcBuffer = Buffer.from(base64Data, "base64")
        }
      }

      // Si no, buscar ruta de archivo
      if (!srcBuffer) {
        const logoPath = getLatestLogoFilePath()
        if (logoPath && fs.existsSync(/*turbopackIgnore: true*/ logoPath)) {
          srcBuffer = fs.readFileSync(/*turbopackIgnore: true*/ logoPath)
        }
      }

      if (srcBuffer) {
        const maskableBuffer = generateMaskableIconBuffer(srcBuffer, requestedSize > 256 ? 512 : 192, 0.70)
        return new NextResponse(new Uint8Array(maskableBuffer), {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        })
      }
    }

    // Flujo estándar para favicons e iconos directos
    if (iconSource && typeof iconSource === "string") {
      // Caso 1: Data URI
      const dataMatch = iconSource.match(/^data:([^;]+);base64,(.+)$/)
      if (dataMatch) {
        const mimeType = dataMatch[1] || "image/png"
        const base64Data = dataMatch[2]
        const buffer = Buffer.from(base64Data, "base64")
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })
      }

      // Caso 2: Ruta local en /uploads o /public
      if (iconSource.startsWith("/")) {
        const cleanRel = iconSource.replace(/^\/api\/uploads\//, "").replace(/^\/uploads\//, "").replace(/^\//, "")
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
        const candidatePaths = [
          path.join(/*turbopackIgnore: true*/ process.cwd(), "public", cleanRel),
          path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", path.basename(cleanRel)),
          path.join(/*turbopackIgnore: true*/ uploadDir, path.basename(cleanRel)),
        ]
        for (const p of candidatePaths) {
          if (fs.existsSync(/*turbopackIgnore: true*/ p) && fs.statSync(/*turbopackIgnore: true*/ p).isFile()) {
            const fileBuf = fs.readFileSync(/*turbopackIgnore: true*/ p)
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
            return new NextResponse(new Uint8Array(fileBuf), {
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
  } catch (err) {
    console.error("Error serving dynamic favicon:", err)
  }

  // Fallback a default-favicon.ico o icon.png
  try {
    const iconPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "icon.png")
    if (fs.existsSync(/*turbopackIgnore: true*/ iconPath)) {
      const buf = fs.readFileSync(/*turbopackIgnore: true*/ iconPath)
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }
    const fallbackPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "default-favicon.ico")
    if (fs.existsSync(/*turbopackIgnore: true*/ fallbackPath)) {
      const buf = fs.readFileSync(/*turbopackIgnore: true*/ fallbackPath)
      return new NextResponse(new Uint8Array(buf), {
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
