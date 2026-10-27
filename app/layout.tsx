import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import { ToastProvider } from "@/lib/toast-context";
import { FontWrapper } from "@/components/font-wrapper";
import { getSystemSettingsAction } from "@/app/actions/settings";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.APP_URL || "https://www.maximumevolutionfit.com";
  const defaultTitle = "Maximum Evolution Fit | Gimnasio, Fitness y Entrenamiento";
  const defaultDesc = "Transforma tu cuerpo y mente en Maximum Evolution Fit. Planes de musculación, entrenamiento funcional, pesas, biometría y los mejores entrenadores.";

  try {
    const res = await getSystemSettingsAction();
    const s = res?.settings;
    const appName = s?.appName || "Maximum Evolution Fit";
    const title = `${appName} | Gimnasio, Fitness y Entrenamiento`;
    const description = s?.landingSettings?.tagline || defaultDesc;

    const rawIcon = s?.faviconUrl || s?.logoUrl || s?.logoUrlDark || "";
    const versionHash = rawIcon
      ? Buffer.from(rawIcon.slice(-32)).toString("hex").slice(0, 12)
      : "default";
    const iconUrl = `/api/favicon?v=${versionHash}`;
    const ogImage = s?.logoUrl || s?.logoUrlDark || `${siteUrl}/api/favicon`;

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: title,
        template: `%s | ${appName}`,
      },
      description,
      applicationName: appName,
      keywords: [
        "gimnasio",
        "fitness",
        "musculación",
        "entrenamiento funcional",
        "planes de gimnasio",
        "pesas",
        "coach personalizado",
        "entrenador personal",
        appName,
        "Maximum Evolution Fit",
        "gimnasio cerca de mi",
        "membresías fitness",
        "salud y bienestar",
        "bodybuilding",
      ],
      authors: [{ name: appName }],
      creator: appName,
      publisher: appName,
      alternates: {
        canonical: "/",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        type: "website",
        locale: "es_VE",
        url: siteUrl,
        siteName: appName,
        title,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: appName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: appName,
      },
      icons: {
        icon: [{ url: iconUrl }],
        shortcut: [{ url: iconUrl }],
        apple: [{ url: iconUrl, sizes: "180x180" }],
      },
    };
  } catch {
    return {
      metadataBase: new URL(siteUrl),
      title: defaultTitle,
      description: defaultDesc,
      applicationName: "Maximum Evolution Fit",
      keywords: ["gimnasio", "fitness", "musculación", "entrenadores", "pesas"],
      alternates: {
        canonical: "/",
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        type: "website",
        locale: "es_VE",
        url: siteUrl,
        siteName: "Maximum Evolution Fit",
        title: defaultTitle,
        description: defaultDesc,
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: defaultDesc,
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Maximum Evolution Fit",
      },
      icons: {
        icon: "/api/favicon",
        shortcut: "/api/favicon",
        apple: "/api/favicon",
      },
    };
  }
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialSettings: any = null;
  try {
    const res = await getSystemSettingsAction();
    if (res?.success && res.settings) {
      initialSettings = res.settings;
    }
  } catch (err) {
    console.error("Error fetching initial settings in RootLayout:", err);
  }

  const primaryLogo = initialSettings?.logoUrl || initialSettings?.logoUrlDark;
  const darkLogo = initialSettings?.logoUrlDark;
  const firstSlideImg = initialSettings?.landingSettings?.heroSlides?.[0]?.type === 'image'
    ? initialSettings?.landingSettings?.heroSlides?.[0]?.url
    : undefined;

  // Solo precargar URLs externas o relativas, NUNCA Data URIs base64
  const canPreload = (url?: string) => url && typeof url === "string" && !url.startsWith("data:") && (url.startsWith("/") || url.startsWith("http"));

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preload prioritario de logos e imágenes críticas antes de renderizar la página */}
        {canPreload(primaryLogo) && (
          <link rel="preload" as="image" href={primaryLogo} {...({ fetchPriority: "high" } as any)} />
        )}
        {canPreload(darkLogo) && darkLogo !== primaryLogo && (
          <link rel="preload" as="image" href={darkLogo} {...({ fetchPriority: "high" } as any)} />
        )}
        {canPreload(firstSlideImg) && (
          <link rel="preload" as="image" href={firstSlideImg} {...({ fetchPriority: "high" } as any)} />
        )}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MaximumFitAPP" />
        <meta name="theme-color" content="#eab308" />

        {/* Script síncrono para inicializar configuración antes de la hidratación (sanitizado contra XSS y HTML breaks) */}
        <script
          id="gympro-instant-settings"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.__INITIAL_SETTINGS__ = ${JSON.stringify(initialSettings || null).replace(/</g, '\\u003c')};
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <SettingsProvider initialSettings={initialSettings}>
          <ToastProvider>
            <FontWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <AuthProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                  <PWAInstallPrompt />
                </AuthProvider>
              </ThemeProvider>
            </FontWrapper>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
