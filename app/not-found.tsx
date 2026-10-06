"use client"

import Link from "next/link"
import { ArrowLeft, Dumbbell, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* Resplandor dorado de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Dumbbell className="h-10 w-10 -rotate-45 text-primary" aria-hidden="true" />
        </div>

        <p className="page-404 font-display" aria-hidden="true">404</p>

        <h1 className="font-display text-3xl font-extrabold uppercase text-foreground sm:text-4xl">
          Esta rutina no existe
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          La página que buscas no se encuentra o fue movida. Vuelve al inicio y retoma tu entrenamiento.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
            <Home className="h-5 w-5" aria-hidden="true" /> Ir al inicio
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}
