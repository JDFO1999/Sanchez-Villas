"use client"

/**
 * Comprime y redimensiona una imagen en el navegador usando HTML5 Canvas.
 * Esto reduce imágenes de teléfonos (6MB - 12MB) a ~100KB-200KB en milisegundos,
 * asegurando subidas ultra-rápidas y evitando límites de payload o memoria.
 */
export async function compressImage(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.8,
  maxBase64Length = 48000
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si no es imagen o es SVG, retornamos dataUrl directo
    if (!file.type.startsWith("image/") || file.type.includes("svg")) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        const render = (w: number, h: number, q: number): string => {
          canvas.width = w
          canvas.height = h
          // Fondo blanco sólido para evitar fondos negros en PNG transparentes
          ctx.fillStyle = "#FFFFFF"
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          return canvas.toDataURL("image/jpeg", q)
        }

        let currentW = width
        let currentH = height
        let currentQ = quality
        let result = render(currentW, currentH, currentQ)

        // Si excede maxBase64Length, reducimos gradualmente dimensiones y calidad
        let attempts = 0
        while (result.length > maxBase64Length && attempts < 12) {
          attempts++
          if (currentQ > 0.45) {
            currentQ = Math.max(0.35, currentQ - 0.1)
          } else if (currentW > 160) {
            currentW = Math.round(currentW * 0.8)
            currentH = Math.round(currentH * 0.8)
          } else {
            currentQ = Math.max(0.2, currentQ - 0.05)
          }
          result = render(currentW, currentH, currentQ)
        }

        resolve(result)
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
