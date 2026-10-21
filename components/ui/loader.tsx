"use client"

import React from 'react'
import { GymLoader, FullScreenGymLoader } from './gym-loader'

export const Loader = ({ className = "", size = 40, text = "" }: any) => {
  const pixelSize = typeof size === "number" ? size : 40
  return (
    <div className={`flex flex-col items-center justify-center gap-3 select-none py-4 ${className}`}>
      <div 
        className="rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
        style={{ width: pixelSize, height: pixelSize }}
      />
      {text && (
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground animate-pulse text-center">
          {text}
        </span>
      )}
    </div>
  )
}

export const FullScreenLoader = ({ text = "", progressive = true, progress }: { text?: string; progressive?: boolean; progress?: number }) => {
  return <FullScreenGymLoader text={text} progressive={progressive} progress={progress} />
}

export { GymLoader, FullScreenGymLoader }
export { ProgressiveRouteLoader } from './progressive-route-loader'
export { Skeleton, CardGridSkeleton, CoachCardSkeleton, AthleteCardSkeleton } from './skeleton'


