import { readFile } from "fs/promises"
import path from "path"
import { getUploadDir } from "@/lib/image-utils"
import { getAuthUser } from "@/lib/authz"

/**
 * Sirve las imágenes subidas (/uploads/<archivo>) desde UPLOAD_DIR EN TIEMPO DE EJECUCIÓN.
 * Next solo sirve de forma fiable los archivos de /public que existían al construir la app, así que
 * en producción las imágenes subidas después necesitan este handler (y un volumen persistente).
 *
 * - Solo nombres planos con extensión de imagen permitida (sin rutas ni "..").
 * - Los comprobantes de pago (receipt_*) exigen sesión: son datos financieros de clientes.
 */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

const notFound = () => new Response("No encontrado", { status: 404 })

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params
  if (!Array.isArray(parts) || parts.length !== 1) return notFound()

  const name = parts[0]
  const match = name.match(/^[A-Za-z0-9._-]{1,120}\.(jpg|jpeg|png|webp)$/i)
  if (!match || name.includes("..")) return notFound()

  const isReceipt = name.startsWith("receipt_")
  if (isReceipt && !(await getAuthUser())) return new Response("No autorizado", { status: 401 })

  const dir = path.resolve(getUploadDir())
  const file = path.resolve(dir, name)
  if (!file.startsWith(dir + path.sep)) return notFound()

  try {
    const data = await readFile(file)
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[match[1].toLowerCase()],
        "Content-Length": String(data.length),
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        // Nombres aleatorios e inmutables: cacheables un año. Los comprobantes, nunca en caché compartida.
        "Cache-Control": isReceipt ? "private, no-store" : "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return notFound()
  }
}
