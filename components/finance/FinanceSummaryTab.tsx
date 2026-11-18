"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Users } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export interface FinanceSummaryTabProps {
  settings: {
    storeCurrency?: string
    storeCurrencySecondary?: string
    storeExchangeRate?: number
    [key: string]: any
  }
  totalIngresos: number
  totalEgresos: number
  balanceNeto: number
  estimatedDebt: number
  totalGymProfitFromCoaches: number
  projectedLiquidity: number
  mrr: number
  upcomingPayroll: number
  finanzasData: any[]
  pieChartIngresosData: any[]
  pieChartData: any[]
  colors: string[]
  colorsIn: string[]
  onDownloadReport: (type: string) => void
}

export function FinanceSummaryTab({
  settings,
  totalIngresos,
  totalEgresos,
  balanceNeto,
  estimatedDebt,
  totalGymProfitFromCoaches,
  projectedLiquidity,
  mrr,
  upcomingPayroll,
  finanzasData,
  pieChartIngresosData,
  pieChartData,
  colors,
  colorsIn,
  onDownloadReport,
}: FinanceSummaryTabProps) {
  const currency = settings.storeCurrency || "$"
  const secondaryCurrency = settings.storeCurrencySecondary || "BsS"
  const rate = settings.storeExchangeRate || 1

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ingresos Totales */}
        <Card className="glass border-success/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-success">
              {currency} {totalIngresos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {secondaryCurrency} {(totalIngresos * rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Egresos Totales */}
        <Card className="glass border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">
              {currency} {totalEgresos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {secondaryCurrency} {(totalEgresos * rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Balance Neto */}
        <Card className={`glass ${balanceNeto >= 0 ? "border-primary/20" : "border-destructive/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle>
            <Wallet className={`h-4 w-4 ${balanceNeto >= 0 ? "text-primary" : "text-destructive"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${balanceNeto >= 0 ? "text-foreground" : "text-destructive"}`}>
              {currency} {balanceNeto.toFixed(2)}
            </div>
            <p className={`text-xs mt-1 ${balanceNeto >= 0 ? "text-primary" : "text-destructive"}`}>
              {secondaryCurrency} {(balanceNeto * rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Por Cobrar */}
        <Card className="glass border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Por Cobrar</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">
              {currency} {estimatedDebt.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {secondaryCurrency} {(estimatedDebt * rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Rentabilidad Staff */}
        <Card className="glass border-info/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rentabilidad Staff</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-info">
              {currency} {totalGymProfitFromCoaches.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {secondaryCurrency} {(totalGymProfitFromCoaches * rate).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* MRR / Liquidez Proyectada */}
        <Card className="glass border-success/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR / Liquidez Proyectada</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-success">
              {currency} {projectedLiquidity.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              MRR: {currency} {mrr.toFixed(2)} - Nómina: {currency} {upcomingPayroll.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Flujo de Ingresos y Egresos */}
        <Card className="glass lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Flujo de Ingresos y Egresos</CardTitle>
            <button
              onClick={() => onDownloadReport("Resumen")}
              className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary hover:text-foreground transition cursor-pointer"
            >
              Descargar Reporte
            </button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finanzasData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${currency} ${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: any) => [
                    `${currency} ${Number(value).toFixed(2)} (${secondaryCurrency} ${(Number(value) * rate).toFixed(2)})`,
                    "",
                  ]}
                />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorEgresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Ingresos */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Distribución de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            {pieChartIngresosData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartIngresosData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartIngresosData.map((_, index) => (
                      <Cell key={`cell-in-${index}`} fill={colorsIn[index % colorsIn.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currency} ${Number(value).toFixed(2)}`, "Monto"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay ingresos registrados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gastos Administrativos */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Gastos Administrativos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currency} ${Number(value).toFixed(2)}`, "Monto"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay gastos registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
