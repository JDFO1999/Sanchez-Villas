import type { NextConfig } from "next";

const securityHeaders = [
  // Impide que otro sitio meta la app en un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador respeta el tipo MIME declarado (evita que un archivo subido se ejecute como script)
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La cámara solo para esta app (lector QR); el resto de sensores, desactivados
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  // HTTPS obligatorio durante 1 año (solo se aplica cuando se sirve por HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // CSP acotada a lo que no rompe Next/SweetAlert: sin plugins, sin <base>, sin iframes ajenos, formularios solo a este origen
  {
    key: "Content-Security-Policy",
    value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Las imágenes se limitan a 5MB en el servidor; este tope cubre el base64 (+33%)
      bodySizeLimit: '8mb',
    }
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
