import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://www.maximumevolutionfit.com'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/inicio', '/registro', '/login'],
      disallow: [
        '/api/',
        '/ajustes',
        '/finanzas',
        '/atletas',
        '/membresias',
        '/tienda',
        '/empleados',
        '/entrenadores',
        '/asistencia',
        '/planes',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
