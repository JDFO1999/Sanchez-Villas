import { MetadataRoute } from "next"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let appName = "MaximumFitAPP"
  let tagline = "Sistema de Gestión y Entrenamiento Fitness"
  let themeColor = "#eab308"
  let bgColor = "#09090b"

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })
    if (record?.data) {
      const parsed = JSON.parse(record.data)
      if (parsed.landingSettings?.tagline) tagline = parsed.landingSettings.tagline
    }
  } catch {}

  return {
    name: "MaximumFitAPP",
    short_name: "MaximumFitAPP",
    description: tagline,
    start_url: "/",
    display: "standalone",
    background_color: bgColor,
    theme_color: themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/api/favicon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/api/favicon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/api/favicon?size=512&maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    categories: ["fitness", "health", "sports", "lifestyle"]
  }
}
