"use client"

import React from "react"

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent ${className}`}
      {...props}
    />
  )
}

/**
 * Esqueleto para tarjetas de Entrenadores con efecto reflejo idéntico al card real
 */
export function CoachCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-card p-5 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Luz reflejo en toda la tarjeta */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent pointer-events-none" />

      <div>
        {/* Fila Superior: Avatar + Info */}
        <div className="flex items-start gap-3.5">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Badges de Métricas */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/50">
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>

      {/* Botones inferiores */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Esqueleto para tarjetas de Atletas con efecto reflejo
 */
export function AthleteCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent pointer-events-none" />

      <div className="space-y-4">
        {/* Fila Superior: Avatar + Info + Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Info de Membresía */}
        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Acciones inferiores */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Grid de tarjetas tipo reflejo (para Entrenadores, Atletas, o genérico)
 */
export function CardGridSkeleton({
  count = 6,
  variant = "coach",
  className = "",
}: {
  count?: number
  variant?: "coach" | "athlete" | "default"
  className?: string
}) {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {items.map((i) =>
        variant === "coach" ? (
          <CoachCardSkeleton key={i} />
        ) : (
          <AthleteCardSkeleton key={i} />
        )
      )}
    </div>
  )
}
