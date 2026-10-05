'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aquí podrías loguear el error a un servicio como Sentry si lo tuvieras.
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 p-4 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <svg
          className="h-10 w-10 text-red-600 dark:text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">¡Uy! Algo salió mal.</h2>
      <p className="max-w-md text-sm text-gray-500 dark:text-zinc-400">
        Ha ocurrido un error inesperado de conexión o interno. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
