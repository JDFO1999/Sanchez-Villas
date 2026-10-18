import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Carpeta donde se guardan las imágenes subidas. En desarrollo: public/uploads.
 * En producción define UPLOAD_DIR apuntando a un VOLUMEN PERSISTENTE (p. ej. /data/uploads); si no,
 * las imágenes se pierden en cada despliegue. Se sirven mediante app/uploads/[...path]/route.ts.
 */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

/** Detecta el tipo REAL por la firma del archivo (no se confía en lo que declare el cliente). */
function sniffImage(buf: Buffer): "jpg" | "png" | "webp" | "svg" {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  // SVG sniffing: XML / <svg tag
  const textHead = buf.subarray(0, 1024).toString("utf8").trim().toLowerCase();
  if (textHead.includes("<svg") || (textHead.startsWith("<?xml") && textHead.includes("<svg"))) {
    return "svg";
  }
  return "jpg";
}

/**
 * Guarda una imagen enviada como data URI en public/uploads y devuelve su URL.
 * - Soporta SVG, PNG, JPG, JPEG y WEBP.
 * - Máximo 10MB. Nombre aleatorio; `prefix` se limpia a [a-z0-9_-] (sin rutas).
 * - Si recibe una URL (http/https o ruta que empiece con "/") la devuelve; cualquier otra cosa se descarta.
 */
export async function saveBase64Image(base64Str: string | null | undefined, prefix = "img"): Promise<string | null> {
  if (!base64Str) return null;

  if (!base64Str.startsWith("data:")) {
    return /^(https?:\/\/|\/)/.test(base64Str) ? base64Str : null;
  }

  const commaIdx = base64Str.indexOf(",");
  if (commaIdx === -1) {
    throw new Error("Formato de imagen no permitido.");
  }

  const header = base64Str.slice(0, commaIdx).toLowerCase();
  const rawBase64 = base64Str.slice(commaIdx + 1).replace(/\s/g, "");

  if (header.includes("image/svg+xml") && header.includes("utf8,")) {
    const svgText = decodeURIComponent(base64Str.slice(base64Str.indexOf("utf8,") + 5));
    const buffer = Buffer.from(svgText, "utf8");
    const safePrefix = (prefix.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "img").slice(0, 24);
    const uploadsDir = getUploadDir();
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${safePrefix}_${crypto.randomBytes(12).toString("hex")}.svg`;
    await writeFile(path.join(uploadsDir, filename), buffer);
    return `/uploads/${filename}`;
  }

  if (!header.includes("image/")) {
    throw new Error("El archivo no es una imagen permitida.");
  }

  const buffer = Buffer.from(rawBase64, "base64");
  if (buffer.length === 0 || buffer.length > MAX_SIZE) {
    throw new Error("La imagen está vacía o excede el máximo permitido (10MB).");
  }

  const ext = sniffImage(buffer);
  const safePrefix = (prefix.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "img").slice(0, 24);
  const uploadsDir = getUploadDir();
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${safePrefix}_${crypto.randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
