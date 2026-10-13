"use client"

import React from "react"
import { GymLoader } from "@/components/ui/gym-loader"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background">
      <GymLoader size="lg" />
    </div>
  )
}
