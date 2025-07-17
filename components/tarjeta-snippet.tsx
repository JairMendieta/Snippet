"use client"

import type { Snippet } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Eye, CopyIcon, Heart, BarChart3, Clock, Star } from "lucide-react"
import { useState } from "react"
import { obtenerCategorias, marcarComoUsado } from "@/lib/storage"
import Link from "next/link"

interface TarjetaSnippetProps {
  snippet: Snippet
  onEliminar: (id: string) => void
  onDuplicar: (id: string) => void
  onAlternarFavorito: (id: string) => void
}

export function TarjetaSnippet({ snippet, onEliminar, onDuplicar, onAlternarFavorito }: TarjetaSnippetProps) {
  const [copiado, setCopiado] = useState(false)
  const categorias = obtenerCategorias()
  const categoria = categorias.find((c) => c.id === snippet.categoria)

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(snippet.codigo)
      setCopiado(true)
      marcarComoUsado(snippet.id)
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      console.error("Error al copiar:", error)
    }
  }

  const formatearFecha = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatearFechaCompleta = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{snippet.titulo}</CardTitle>
              {snippet.favorito && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            {snippet.descripcion && <CardDescription className="text-sm">{snippet.descripcion}</CardDescription>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="capitalize"
              style={{ backgroundColor: categoria?.color + "20", color: categoria?.color }}
            >
              {snippet.lenguaje}
            </Badge>
            {categoria && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: categoria.color, color: categoria.color }}
              >
                {categoria.nombre}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-hidden text-ellipsis max-h-32 font-mono">
            <code>
              {snippet.codigo.substring(0, 200)}
              {snippet.codigo.length > 200 ? "..." : ""}
            </code>
          </pre>
        </div>

        {snippet.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 mb-3">
            {snippet.etiquetas.map((etiqueta) => (
              <Badge key={etiqueta} variant="outline" className="text-xs">
                {etiqueta}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Creado: {formatearFecha(snippet.creadoEn)}</span>
          </div>
          {snippet.actualizadoEn !== snippet.creadoEn && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Actualizado: {formatearFecha(snippet.actualizadoEn)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            <span>Usado {snippet.vecesUsado} veces</span>
          </div>
          {snippet.ultimoUso && (
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span title={formatearFechaCompleta(snippet.ultimoUso)}>
                Último uso: {formatearFecha(snippet.ultimoUso)}
              </span>
            </div>
          )}
        </div>

        {snippet.notas && (
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-3">
            <strong>Nota:</strong> {snippet.notas}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link href={`/snippet/${snippet.id}`} className="col-span-2">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={copiarAlPortapapeles} className="bg-transparent">
            <CopyIcon className="h-4 w-4 mr-1" />
            {copiado ? "¡Copiado!" : "Copiar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAlternarFavorito(snippet.id)}
            className={`bg-transparent ${snippet.favorito ? "text-yellow-600" : ""}`}
          >
            <Heart className={`h-4 w-4 mr-1 ${snippet.favorito ? "fill-current" : ""}`} />
            {snippet.favorito ? "Quitar" : "Favorito"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDuplicar(snippet.id)} className="bg-transparent">
            <Copy className="h-4 w-4 mr-1" />
            Duplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEliminar(snippet.id)}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
