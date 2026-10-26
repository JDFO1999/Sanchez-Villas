import { NextRequest, NextResponse } from "next/server"
import { runDailyNotificationChecks } from "@/app/actions/notifications"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get("key")

    const validKey = process.env.CRON_SECRET || process.env.JWT_SECRET || "maxfit_cron_secret"

    if (key !== validKey) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Token de cron inválido." },
        { status: 401 }
      )
    }

    const result = await runDailyNotificationChecks(true)

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      summary: result.summary,
      error: result.error
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error al ejecutar cron de notificaciones" },
      { status: 500 }
    )
  }
}
