"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, Dumbbell, Flame, TrendingUp } from "lucide-react"

export function AthleteDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {user?.name?.split(' ')[1] || 'Atleta'}</h1>
          <p className="text-muted-foreground mt-1">
            Aquí está tu progreso y resumen de hoy.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          Ver Rutina de Hoy
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha Actual
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Días</div>
            <p className="text-xs text-muted-foreground mt-1">
              ¡Sigue así! Estás en racha.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asistencias Mes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 / 20</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progreso hacia tu meta mensual
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Membresía
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Activa</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vence en 14 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carga Máxima (PR)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120 kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sentadilla libre
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Entrenamiento de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <h4 className="font-medium text-primary mb-1">Día 4: Pierna y Glúteo</h4>
                <p className="text-sm text-muted-foreground mb-3">Enfocado en hipertrofia y fuerza máxima.</p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>1. Sentadilla Libre</span>
                    <span className="text-muted-foreground">4 x 10-12</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>2. Prensa Inclinada</span>
                    <span className="text-muted-foreground">4 x 12</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>3. Extensión de Cuádriceps</span>
                    <span className="text-muted-foreground">3 x 15</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Hoy", type: "Pierna y Glúteo", status: "Pendiente" },
                { date: "Ayer", type: "Espalda y Bíceps", status: "Completado" },
                { date: "Hace 2 días", type: "Pecho y Tríceps", status: "Completado" },
                { date: "Hace 3 días", type: "Descanso Activo", status: "Completado" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-secondary/20 transition">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.status === 'Completado' ? 'bg-green-500' : 'bg-primary'}`} />
                    <div>
                      <p className="font-medium text-sm">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'Completado' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
