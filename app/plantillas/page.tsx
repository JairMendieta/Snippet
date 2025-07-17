"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PLANTILLAS_PREDEFINIDAS, type Snippet } from "@/lib/types"
import { guardarSnippet, obtenerCategorias } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Eye, Code2 } from "lucide-react"
import Link from "next/link"
import { EditorMonacoReact } from "@/components/editor-monaco-react"

export default function PaginaPlantillas() {
  const router = useRouter()
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<number | null>(null)
  const categorias = obtenerCategorias()

  const usarPlantilla = (plantilla: (typeof PLANTILLAS_PREDEFINIDAS)[0]) => {
    const snippet: Snippet = {
      id: crypto.randomUUID(),
      titulo: plantilla.titulo,
      descripcion: `Creado desde plantilla: ${plantilla.titulo}`,
      lenguaje: plantilla.lenguaje,
      codigo: plantilla.codigo,
      etiquetas: plantilla.etiquetas,
      categoria: plantilla.categoria,
      favorito: false,
      vecesUsado: 0,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      historial: [
        {
          id: crypto.randomUUID(),
          fecha: new Date().toISOString(),
          accion: "creado",
          descripcion: "Snippet creado desde plantilla",
        },
      ],
    }

    guardarSnippet(snippet)
    router.push(`/snippet/${snippet.id}`)
  }

  const obtenerCategoria = (categoriaId: string) => {
    return categorias.find((c) => c.id === categoriaId)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Plantillas de Código</h1>
              <p className="text-gray-600">Comienza rápidamente con estas plantillas predefinidas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Plantillas Disponibles</h2>
            {PLANTILLAS_PREDEFINIDAS.map((plantilla, index) => {
              const categoria = obtenerCategoria(plantilla.categoria)
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    plantillaSeleccionada === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setPlantillaSeleccionada(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{plantilla.titulo}</CardTitle>
                        <CardDescription className="mt-1">Plantilla para {plantilla.lenguaje}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="capitalize">
                          {plantilla.lenguaje}
                        </Badge>
                        {categoria && (
                          <Badge variant="outline" style={{ borderColor: categoria.color, color: categoria.color }}>
                            {categoria.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {plantilla.etiquetas.map((etiqueta) => (
                        <Badge key={etiqueta} variant="outline" className="text-xs">
                          {etiqueta}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPlantillaSeleccionada(index)
                        }}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          usarPlantilla(plantilla)
                        }}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Usar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="sticky top-8">
            {plantillaSeleccionada !== null ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Vista Previa</h3>
                  <Button
                    onClick={() => usarPlantilla(PLANTILLAS_PREDEFINIDAS[plantillaSeleccionada])}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Usar Esta Plantilla
                  </Button>
                </div>
                <EditorMonacoReact
                  codigo={PLANTILLAS_PREDEFINIDAS[plantillaSeleccionada].codigo}
                  lenguaje={PLANTILLAS_PREDEFINIDAS[plantillaSeleccionada].lenguaje}
                  soloLectura
                  altura="500px"
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una plantilla</h3>
                <p className="text-gray-600">Haz clic en cualquier plantilla para ver una vista previa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
