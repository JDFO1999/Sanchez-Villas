import { readFile, writeFile, mkdir } from "fs/promises"
import fs from "fs"
import path from "path"
import { getUploadDir } from "@/lib/image-utils"
import { getAuthUser } from "@/lib/authz"
import prisma from "@/lib/db"

/**
 * Sirve las imágenes subidas (/uploads/<archivo>) con triple nivel de persistencia y auto-recuperación:
 * 1. Lee del volumen configurado en UPLOAD_DIR (p. ej. /data/uploads).
 * 2. Si no existe, busca en la carpeta estática del proyecto (/app/public/uploads).
 * 3. Si tampoco existe (p. ej. tras redesplegar un contenedor efímero en Coolify sin volumen montado),
 *    busca el archivo en la base de datos (UploadAsset), lo restaura en el disco y lo entrega sin error.
 */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
}

const notFound = () => new Response("No encontrado", { status: 404 })

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params
  if (!Array.isArray(parts) || parts.length !== 1) return notFound()

  const name = parts[0]
  const match = name.match(/^[A-Za-z0-9._-]{1,120}\.(jpg|jpeg|png|webp|svg)$/i)
  if (!match || name.includes("..")) return notFound()

  const isReceipt = name.startsWith("receipt_")
  if (isReceipt && !(await getAuthUser())) return new Response("No autorizado", { status: 401 })

  const ext = match[1].toLowerCase()
  const defaultMime = TYPES[ext] || "image/png"

  // 1. Intentar leer desde UPLOAD_DIR
  const primaryDir = path.resolve(getUploadDir())
  const primaryFile = path.resolve(primaryDir, name)

  if (primaryFile.startsWith(primaryDir + path.sep)) {
    try {
      const data = await readFile(primaryFile)
      return new Response(new Uint8Array(data), {
        headers: {
          "Content-Type": defaultMime,
          "Content-Length": String(data.length),
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; sandbox",
          "Cache-Control": isReceipt ? "private, no-store" : "public, max-age=31536000, immutable",
        },
      })
    } catch (_) {}
  }

  // 2. Intentar leer desde /public/uploads del proyecto (archivos empaquetados en la imagen Docker)
  const fallbackDir = path.resolve(process.cwd(), "public", "uploads")
  const fallbackFile = path.resolve(fallbackDir, name)

  if (fallbackFile.startsWith(fallbackDir + path.sep)) {
    try {
      if (fs.existsSync(fallbackFile)) {
        const data = await readFile(fallbackFile)
        // Intentar copiar al UPLOAD_DIR primario para unificar
        try {
          await mkdir(primaryDir, { recursive: true })
          await writeFile(primaryFile, data)
        } catch (_) {}

        return new Response(new Uint8Array(data), {
          headers: {
            "Content-Type": defaultMime,
            "Content-Length": String(data.length),
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "Cache-Control": isReceipt ? "private, no-store" : "public, max-age=31536000, immutable",
          },
        })
      }
    } catch (_) {}
  }

  // 3. Fallback inteligente a MySQL: Auto-restauración desde UploadAsset
  try {
    const asset = await prisma.uploadAsset.findUnique({
      where: { filename: name },
    })

    if (asset && asset.data) {
      const isSvg = ext === "svg" || (asset.mimeType && asset.mimeType.includes("svg"))
      const buffer = isSvg && !asset.data.startsWith("iVBOR") // si es texto crudo de SVG
        ? (asset.data.includes("<svg") ? Buffer.from(asset.data, "utf8") : Buffer.from(asset.data, "base64"))
        : Buffer.from(asset.data, "base64")

      // Restaurar el archivo físico en el disco para que futuras visitas no toquen la base de datos
      try {
        await mkdir(primaryDir, { recursive: true })
        await writeFile(primaryFile, buffer)
      } catch (writeErr) {
        console.warn("Aviso: no se pudo escribir archivo restaurado a disco:", writeErr)
      }

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": asset.mimeType || defaultMime,
          "Content-Length": String(buffer.length),
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; sandbox",
          "Cache-Control": isReceipt ? "private, no-store" : "public, max-age=31536000, immutable",
        },
      })
    }
  } catch (dbErr) {
    console.error("Error al auto-recuperar imagen desde UploadAsset:", dbErr)
  }

  return notFound()
}
