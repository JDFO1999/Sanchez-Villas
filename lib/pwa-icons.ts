import fs from "fs"
import path from "path"
import { decode, encode } from "fast-png"

/**
 * Genera un icono PNG cuadrado (por defecto 512x512) con el logo centrado
 * dentro de la 'Safe Zone' (diámetro del 70-75% del canvas).
 * Esto garantiza que al abrir la app móvil o instalar la PWA en Android e iOS,
 * el recorte circular (maskable) o squircle NUNCA corte los bordes ni las letras del logo.
 */
export function generateMaskableIconBuffer(
  imageBuffer: Buffer,
  size = 512,
  safeRatio = 0.70,
  bgR = 9,
  bgG = 9,
  bgB = 11
): Buffer {
  try {
    const src = decode(imageBuffer)
    if (!src || !src.width || !src.height) {
      throw new Error("Formato de imagen no compatible para decodificación PNG")
    }

    const maxSafeW = Math.round(size * safeRatio)
    const maxSafeH = Math.round(size * safeRatio)

    const scale = Math.min(maxSafeW / src.width, maxSafeH / src.height)
    const targetW = Math.max(1, Math.round(src.width * scale))
    const targetH = Math.max(1, Math.round(src.height * scale))

    const offsetX = Math.round((size - targetW) / 2)
    const offsetY = Math.round((size - targetH) / 2)

    // Crear canvas con fondo de la app (#09090b)
    const outData = new Uint8Array(size * size * 4)
    for (let i = 0; i < size * size; i++) {
      const idx = i * 4
      outData[idx] = bgR
      outData[idx + 1] = bgG
      outData[idx + 2] = bgB
      outData[idx + 3] = 255
    }

    // Muestreo bilineal del logo original
    for (let y = 0; y < targetH; y++) {
      const srcY = targetH > 1 ? (y / (targetH - 1)) * (src.height - 1) : 0
      const y0 = Math.floor(srcY)
      const y1 = Math.min(y0 + 1, src.height - 1)
      const dy = srcY - y0

      for (let x = 0; x < targetW; x++) {
        const srcX = targetW > 1 ? (x / (targetW - 1)) * (src.width - 1) : 0
        const x0 = Math.floor(srcX)
        const x1 = Math.min(x0 + 1, src.width - 1)
        const dx = srcX - x0

        const outIdx = ((offsetY + y) * size + (offsetX + x)) * 4

        const idx00 = (y0 * src.width + x0) * src.channels
        const idx10 = (y0 * src.width + x1) * src.channels
        const idx01 = (y1 * src.width + x0) * src.channels
        const idx11 = (y1 * src.width + x1) * src.channels

        // Alpha channel
        const a00 = src.channels === 4 ? src.data[idx00 + 3] : 255
        const a10 = src.channels === 4 ? src.data[idx10 + 3] : 255
        const a01 = src.channels === 4 ? src.data[idx01 + 3] : 255
        const a11 = src.channels === 4 ? src.data[idx11 + 3] : 255

        const alpha = ((a00 * (1 - dx) + a10 * dx) * (1 - dy) + (a01 * (1 - dx) + a11 * dx) * dy) / 255

        if (alpha <= 0.01) continue

        for (let c = 0; c < 3; c++) {
          const top = src.data[idx00 + c] * (1 - dx) + src.data[idx10 + c] * dx
          const bot = src.data[idx01 + c] * (1 - dx) + src.data[idx11 + c] * dx
          const colorVal = top * (1 - dy) + bot * dy

          const bgVal = c === 0 ? bgR : c === 1 ? bgG : bgB
          outData[outIdx + c] = Math.round(colorVal * alpha + bgVal * (1 - alpha))
        }
        outData[outIdx + 3] = 255
      }
    }

    const encoded = encode({
      width: size,
      height: size,
      data: outData,
      channels: 4,
    })

    return Buffer.from(encoded)
  } catch (err) {
    console.error("Error generating maskable icon:", err)
    return imageBuffer
  }
}

/**
 * Resuelve la ruta física del archivo del logo más reciente en el servidor.
 */
export function getLatestLogoFilePath(): string | null {
  const uploadDir = process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
  const candidates = [
    path.join(/*turbopackIgnore: true*/ uploadDir, "sys_logourl_537fc153bd61e2b18a3bf2de.png"),
    path.join(/*turbopackIgnore: true*/ uploadDir, "sys_logourldark_8456539f5fe89f8796d1f53a.png"),
    path.join(/*turbopackIgnore: true*/ uploadDir, "maximum-logo-full.png"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "icon.png"),
  ]

  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) {
      try {
        if (fs.statSync(/*turbopackIgnore: true*/ c).size > 1000) return c
      } catch (_) {}
    }
  }

  // Buscar cualquier sys_logourl*.png reciente
  if (fs.existsSync(/*turbopackIgnore: true*/ uploadDir)) {
    try {
      const files = fs.readdirSync(/*turbopackIgnore: true*/ uploadDir)
      const logos = files.filter(f => f.startsWith("sys_logourl") && f.endsWith(".png"))
      if (logos.length > 0) {
        return path.join(/*turbopackIgnore: true*/ uploadDir, logos[logos.length - 1])
      }
    } catch (_) {}
  }

  return null
}
