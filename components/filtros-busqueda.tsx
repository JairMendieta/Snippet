"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Search, Star, Code, Filter } from "lucide-react"
import { LENGUAJES_SOPORTADOS } from "@/lib/types"
import { useState } from "react"
import type { Categoria } from "@/lib/types"

interface FiltrosBusquedaProps {
  consulta: string
  lenguaje: string
  etiquetas: string[]
  categoria: string
  soloFavoritos: boolean
  busquedaRegex: boolean
  etiquetasDisponibles: string[]
  categorias: Categoria[]
  onCambioConsulta: (consulta: string) => void
  onCambioLenguaje: (lenguaje: string) => void
  onCambioEtiquetas: (etiquetas: string[]) => void
  onCambioCategoria: (categoria: string) => void
  onCambioSoloFavoritos: (soloFavoritos: boolean) => void
  onCambioBusquedaRegex: (busquedaRegex: boolean) => void
}

export function FiltrosBusqueda({
  consulta,
  lenguaje,
  etiquetas,
  categoria,
  soloFavoritos,
  busquedaRegex,
  etiquetasDisponibles,
  categorias,
  onCambioConsulta,
  onCambioLenguaje,
  onCambioEtiquetas,
  onCambioCategoria,
  onCambioSoloFavoritos,
  onCambioBusquedaRegex,
}: FiltrosBusquedaProps) {
  const [entradaEtiqueta, setEntradaEtiqueta] = useState("")
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)

  const agregarEtiqueta = (etiqueta: string) => {
    if (etiqueta && !etiquetas.includes(etiqueta)) {
      onCambioEtiquetas([...etiquetas, etiqueta])
    }
    setEntradaEtiqueta("")
  }

  const quitarEtiqueta = (etiquetaAQuitar: string) => {
    onCambioEtiquetas(etiquetas.filter((etiqueta) => etiqueta !== etiquetaAQuitar))
  }

  const limpiarFiltros = () => {
    onCambioConsulta("")
    onCambioLenguaje("")
    onCambioEtiquetas([])
    onCambioCategoria("")
    onCambioSoloFavoritos(false)
    onCambioBusquedaRegex(false)
  }

  const hayFiltrosActivos = consulta || lenguaje || etiquetas.length > 0 || categoria || soloFavoritos

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={busquedaRegex ? "Buscar con regex..." : "Buscar snippets..."}
            value={consulta}
            onChange={(e) => onCambioConsulta(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={lenguaje} onValueChange={onCambioLenguaje}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los lenguajes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los lenguajes</SelectItem>
            {LENGUAJES_SOPORTADOS.map((lang) => (
              <SelectItem key={lang} value={lang} className="capitalize">
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoria} onValueChange={onCambioCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>

        {hayFiltrosActivos && (
          <Button variant="outline" onClick={limpiarFiltros}>
            Limpiar
          </Button>
        )}
      </div>

      {mostrarFiltrosAvanzados && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch id="solo-favoritos" checked={soloFavoritos} onCheckedChange={onCambioSoloFavoritos} />
              <Label htmlFor="solo-favoritos" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Solo favoritos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="busqueda-regex" checked={busquedaRegex} onCheckedChange={onCambioBusquedaRegex} />
              <Label htmlFor="busqueda-regex" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Búsqueda con regex
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Agregar filtro de etiqueta..."
                value={entradaEtiqueta}
                onChange={(e) => setEntradaEtiqueta(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    agregarEtiqueta(entradaEtiqueta)
                  }
                }}
                className="flex-1"
              />
              <Button onClick={() => agregarEtiqueta(entradaEtiqueta)} disabled={!entradaEtiqueta}>
                Agregar
              </Button>
            </div>

            {etiquetasDisponibles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-gray-600 mr-2">Etiquetas populares:</span>
                {etiquetasDisponibles.slice(0, 10).map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => agregarEtiqueta(etiqueta)}
                  >
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            )}

            {etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-gray-600 mr-2">Filtros activos:</span>
                {etiquetas.map((etiqueta) => (
                  <Badge key={etiqueta} className="flex items-center gap-1">
                    {etiqueta}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => quitarEtiqueta(etiqueta)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
