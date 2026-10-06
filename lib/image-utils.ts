import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Carpeta donde se guardan las imágenes subidas. En desarrollo: public/uploads.
 * En producción define UPLOAD_DIR apuntando a un VOLUMEN PERSISTENTE (p. ej. /data/uploads); si no,
 * las imágenes se pierden en cada despliegue. Se sirven mediante app/uploads/[...path]/route.ts.
 */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

/** Detecta el tipo REAL por la firma del archivo (no se confía en lo que declare el cliente). */
function sniffImage(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

/**
 * Guarda una imagen enviada como data URI en public/uploads y devuelve su URL.
 * - Solo JPG, PNG y WEBP; el formato se decide por el contenido, no por el texto del cliente.
 * - Máximo 5MB. Nombre aleatorio; `prefix` se limpia a [a-z0-9_-] (sin rutas).
 * - Si recibe una URL (http/https o ruta que empiece con "/") la devuelve; cualquier otra cosa se descarta.
 */
export async function saveBase64Image(base64Str: string | null | undefined, prefix = "img"): Promise<string | null> {
  if (!base64Str) return null;

  if (!base64Str.startsWith("data:")) {
    return /^(https?:\/\/|\/)/.test(base64Str) ? base64Str : null;
  }

  const matches = base64Str.match(/^data:image\/(?:png|jpe?g|webp);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!matches) throw new Error("Formato de imagen no permitido. Solo se aceptan JPG, PNG y WEBP.");

  const buffer = Buffer.from(matches[1], "base64");
  if (buffer.length === 0 || buffer.length > MAX_SIZE) {
    throw new Error("La imagen está vacía o excede el máximo de 5MB.");
  }

  const ext = sniffImage(buffer);
  if (!ext) throw new Error("El archivo no es una imagen válida.");

  const safePrefix = (prefix.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "img").slice(0, 24);
  const uploadsDir = getUploadDir();
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${safePrefix}_${crypto.randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
