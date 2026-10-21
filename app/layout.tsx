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
  try {
    const res = await getSystemSettingsAction();
    const s = res?.settings;
    const rawIcon = s?.faviconUrl || s?.logoUrl || s?.logoUrlDark || "";
    const versionHash = rawIcon
      ? Buffer.from(rawIcon.slice(-32)).toString("hex").slice(0, 12)
      : "default";
    const iconUrl = `/api/favicon?v=${versionHash}`;

    return {
      title: s?.appName ? `${s.appName} - MaximumFitAPP` : "MaximumFitAPP - Sistema de Gestión",
      description: s?.landingSettings?.tagline || "Sistema integral de entrenamiento y administración para gimnasios",
      applicationName: "MaximumFitAPP",
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "MaximumFitAPP",
      },
      manifest: "/manifest.webmanifest",
      icons: {
        icon: [{ url: iconUrl }],
        shortcut: [{ url: iconUrl }],
        apple: [{ url: iconUrl, sizes: "180x180" }],
      },
    };
  } catch {
    return {
      title: "MaximumFitAPP - Sistema de Gestión",
      description: "Sistema integral de entrenamiento y administración para gimnasios",
      applicationName: "MaximumFitAPP",
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "MaximumFitAPP",
      },
      manifest: "/manifest.webmanifest",
      icons: {
        icon: "/api/favicon",
        shortcut: "/api/favicon",
        apple: "/api/favicon",
      },
    };
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
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
      </head>
      <body>
        <SettingsProvider>
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
