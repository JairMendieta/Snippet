"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Code2, TrendingUp, Clock } from "lucide-react"
import type { Estadisticas, Categoria } from "@/lib/types"

interface EstadisticasDashboardProps {
  estadisticas: Estadisticas
  categorias: Categoria[]
}

export function EstadisticasDashboard({ estadisticas, categorias }: EstadisticasDashboardProps) {
  const formatearFecha = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.totalSnippets}</div>
          <p className="text-xs text-muted-foreground">En tu colección</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Más Populares</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {estadisticas.masUsados.slice(0, 2).map((snippet) => (
              <div key={snippet.id} className="flex items-center justify-between">
                <span className="text-sm truncate">{snippet.titulo}</span>
                <Badge variant="secondary" className="text-xs">
                  {snippet.vecesUsado}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lenguajes</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(estadisticas.snippetsPorLenguaje)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([lenguaje, cantidad]) => (
                <div key={lenguaje} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{lenguaje}</span>
                  <Badge variant="outline" className="text-xs">
                    {cantidad}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {estadisticas.recientes.slice(0, 2).map((snippet) => (
              <div key={snippet.id} className="flex items-center justify-between">
                <span className="text-sm truncate">{snippet.titulo}</span>
                <span className="text-xs text-muted-foreground">{formatearFecha(snippet.actualizadoEn)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
