'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div role="alert" className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-4 text-center">
      <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="font-display text-3xl font-extrabold uppercase text-foreground sm:text-4xl">
        Algo salió mal
      </h2>
      <p className="max-w-md text-sm text-muted-foreground sm:text-base">
        Ocurrió un error inesperado de conexión o interno. Intenta de nuevo; si persiste, avisa al administrador.
      </p>
      <Button size="lg" className="mt-5" onClick={() => reset()}>
        <RotateCw className="h-5 w-5" aria-hidden="true" /> Intentar de nuevo
      </Button>
    </div>
  )
}
