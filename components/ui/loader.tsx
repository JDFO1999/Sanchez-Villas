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

export const FullScreenLoader = ({ text = "" }: { text?: string }) => {
  return <FullScreenGymLoader text={text} />
}

export { GymLoader, FullScreenGymLoader }
