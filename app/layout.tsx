import type { Metadata } from "next";
import { Arvo, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import { ToastProvider } from "@/lib/toast-context";
import { FontWrapper } from "@/components/font-wrapper";

const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-arvo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "GymPro - Sistema de Gestión",
  description: "Sistema integral de administración para gimnasios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${arvo.variable} ${inter.variable} ${roboto.variable}`}>
      <body>
        <SettingsProvider>
          <ToastProvider>
            <FontWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <AuthProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                </AuthProvider>
              </ThemeProvider>
            </FontWrapper>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
