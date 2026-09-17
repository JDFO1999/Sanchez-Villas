"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getCoachAthletes } from "@/app/actions/routines"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, Users } from "lucide-react"
import Link from "next/link"

export default function MisAtletasPage() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setIsLoading(true)
    const athRes = await getCoachAthletes(user!.id)
    if (athRes.success) setAthletes(athRes.athletes || [])
    setIsLoading(false)
  }

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.cedula.includes(searchTerm)
  )

  if (user?.role !== "coach" && user?.role !== "admin") {
    return <div className="p-8 font-bold text-red-500 text-center">Acceso Denegado</div>
  }

  return (
    <div className="space-y-6 w-full p-4 sm:p-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:via-white via-black to-primary/50 bg-clip-text text-transparent">Mis Atletas</h1>
        <p className="text-muted-foreground mt-1">
          Lista completa de todos los atletas que entrenas.
        </p>
      </div>

      <Card className="shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Directorio ({athletes.length})
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : filteredAthletes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No se encontraron atletas.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAthletes.map(athlete => (
                <div key={athlete.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-card dark:bg-black/20 flex flex-col gap-3 transition hover:border-primary/50">
                  <div className="flex items-center gap-3">
                    {athlete.profilePicture ? (
                      <img src={athlete.profilePicture} alt={athlete.name} className="w-12 h-12 rounded-full object-cover border border-primary/20 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                        {athlete.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base truncate">{athlete.name}</span>
                      <span className="text-xs text-muted-foreground truncate mb-1">C.I: {athlete.cedula}</span>
                      <div className="flex gap-2">
                        {athlete._count?.athleteRoutines > 0 ? (
                          <span className="text-[9px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full font-bold">Con Rutina</span>
                        ) : (
                          <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold">Sin Rutina</span>
                        )}
                        {athlete._count?.athleteDiets > 0 ? (
                          <span className="text-[9px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">Con Dieta</span>
                        ) : (
                          <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold">Sin Dieta</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/atletas/${athlete.id}`} className="mt-auto w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-black text-foreground text-sm font-bold py-2 rounded-lg transition border border-transparent">
                    <Eye className="w-4 h-4" /> Ver Perfil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
