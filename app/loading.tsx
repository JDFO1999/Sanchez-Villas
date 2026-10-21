"use client"

import React from "react"
import { CardGridSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="h-8 w-48 rounded-xl bg-black/5 dark:bg-white/5 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent" />
      <CardGridSkeleton count={6} />
    </div>
  )
}
