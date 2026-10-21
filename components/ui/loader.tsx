"use client"

import React from 'react'
import { GymLoader, FullScreenGymLoader } from './gym-loader'

export const Loader = ({ className = "", size = 48, color = "currentColor", text = "" }: any) => {
  const loaderSize = size <= 32 ? "sm" : size <= 54 ? "md" : "lg"
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <GymLoader size={loaderSize} text={text} showQuote={!text} />
    </div>
  )
}

export const FullScreenLoader = ({ text = "", progressive = true, progress }: { text?: string; progressive?: boolean; progress?: number }) => {
  return <FullScreenGymLoader text={text} progressive={progressive} progress={progress} />
}

export { GymLoader, FullScreenGymLoader }
export { ProgressiveRouteLoader } from './progressive-route-loader'
export { Skeleton, CardGridSkeleton, CoachCardSkeleton, AthleteCardSkeleton } from './skeleton'


