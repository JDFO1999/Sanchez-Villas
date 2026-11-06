import { MetadataRoute } from "next"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let appName = "MaximumAPP"
  let shortName = "MaximumAPP"
  let tagline = "Sistema de Gestión y Entrenamiento Fitness"
  let themeColor = "#eab308"
  let bgColor = "#09090b"
  let iconPath = "/uploads/sys_logourl_537fc153bd61e2b18a3bf2de.png"

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })
    if (record?.data) {
      const parsed = JSON.parse(record.data)
      if (parsed.landingSettings?.tagline) tagline = parsed.landingSettings.tagline
      if (parsed.mobileAppName) {
        appName = parsed.mobileAppName
        shortName = parsed.mobileAppName
      }
      if (parsed.primaryColor) themeColor = parsed.primaryColor
      // El icono de la App Móvil (PWA) prioriza el logo más reciente del gimnasio
      const chosenLogo = parsed.logoUrl || parsed.logoUrlDark || parsed.faviconUrl
      if (chosenLogo && typeof chosenLogo === "string" && !chosenLogo.startsWith("data:")) {
        iconPath = chosenLogo
      }
    }
  } catch {}

  const versionHash = iconPath ? Buffer.from(iconPath.slice(-32)).toString("hex").slice(0, 8) : Date.now().toString()
  const cleanIconUrl = iconPath.startsWith("/") ? `${iconPath}?v=${versionHash}` : iconPath

  return {
    name: appName,
    short_name: shortName,
    description: tagline,
    start_url: "/",
    display: "standalone",
    background_color: bgColor,
    theme_color: themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: cleanIconUrl,
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: `/api/favicon?v=${versionHash}&maskable=1&size=512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: `/api/favicon?v=${versionHash}&maskable=1&size=192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: `/api/favicon?v=${versionHash}&size=192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: `/api/favicon?v=${versionHash}&size=512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ],
    categories: ["fitness", "health", "sports", "lifestyle"]
  }
}
