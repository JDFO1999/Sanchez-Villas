import type { Metadata } from "next"
import { GymLandingPage } from "@/components/landing/gym-landing-page"

export const metadata: Metadata = {
  title: "Inicio | Maximum Evolution Fit",
  alternates: {
    canonical: "/inicio",
  },
}

export default function InicioLandingPage() {
  return <GymLandingPage />
}
