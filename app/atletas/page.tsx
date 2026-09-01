"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function AtletasPage() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setAthletes(athleteService.getAthletes())
  }, [])

  // Solo Admin y Empleado pueden ver esto
  if (user?.role === 'athlete') {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>
  }

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.cedula.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Directorio de Atletas</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y seguimiento de tus clientes.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {filteredAthletes.map((atleta) => {
          // Determinar estado de membresía
          const endDate = new Date(atleta.membershipEnd)
          const today = new Date()
          const diffTime = endDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          let estadoColor = "text-green-500 bg-green-500/10"
          if (diffDays <= 0) estadoColor = "text-red-500 bg-red-500/10"
          else if (diffDays <= 7) estadoColor = "text-orange-500 bg-orange-500/10"

          return (
            <Link key={atleta.id} href={`/atletas/${atleta.id}`}>
              <Card className="glass transition-all duration-300 cursor-pointer group hover:scale-[1.03] hover:border-primary hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] z-0 hover:z-10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {atleta.profilePicture ? (
                        <img src={atleta.profilePicture} alt={atleta.name} className="h-12 w-12 rounded-full object-cover border border-primary/20" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {atleta.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition">{atleta.name}</h3>
                        <p className="text-xs text-muted-foreground">C.C. {atleta.cedula}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Entrenador</p>
                      <p className="font-medium">{atleta.coachId === '2' ? 'Carlos' : atleta.coachId ? 'Asignado' : 'Sin asignar'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Membresía</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block ${estadoColor}`}>
                        {diffDays > 0 ? `${diffDays} días rest.` : 'Vencida'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
