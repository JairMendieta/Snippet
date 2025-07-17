"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type Snippet, LENGUAJES_SOPORTADOS } from "@/lib/types"
import { obtenerSnippetPorId, guardarSnippet, eliminarSnippet, obtenerCategorias } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Edit, Trash2, X, Star, History, BarChart3 } from "lucide-react"
import Link from "next/link"
import { EditorMonacoReact } from "@/components/editor-monaco-react"
import { AICodeAssistant } from "@/components/ai-code-assistant"
import { CodeCollaboration } from "@/components/code-collaboration"
import { useToast } from "@/hooks/use-toast"

interface SnippetDetailClientProps {
  id: string
}

export function SnippetDetailClient({ id }: SnippetDetailClientProps) {
  const router = useRouter()
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [lenguaje, setLenguaje] = useState("javascript")
  const [codigo, setCodigo] = useState("")
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [categoria, setCategoria] = useState("general")
  const [favorito, setFavorito] = useState(false)
  const [notas, setNotas] = useState("")
  const [entradaEtiqueta, setEntradaEtiqueta] = useState("")
  const [mostrarHistorial, setMostrarHistorial] = useState(false)

  const categorias = obtenerCategorias()
  const { toast } = useToast()

  useEffect(() => {
    const snippetCargado = obtenerSnippetPorId(id)
    if (snippetCargado) {
      setSnippet(snippetCargado)
      setTitulo(snippetCargado.titulo)
      setDescripcion(snippetCargado.descripcion || "")
      setLenguaje(snippetCargado.lenguaje)
      setCodigo(snippetCargado.codigo)
      setEtiquetas(snippetCargado.etiquetas)
      setCategoria(snippetCargado.categoria)
      setFavorito(snippetCargado.favorito)
      setNotas(snippetCargado.notas || "")
    }
  }, [id])

  const agregarEtiqueta = () => {
    if (entradaEtiqueta && !etiquetas.includes(entradaEtiqueta)) {
      setEtiquetas([...etiquetas, entradaEtiqueta])
      setEntradaEtiqueta("")
    }
  }

  const quitarEtiqueta = (etiquetaAQuitar: string) => {
    setEtiquetas(etiquetas.filter((etiqueta) => etiqueta !== etiquetaAQuitar))
  }

  const manejarGuardar = () => {
    if (!snippet || !titulo.trim() || !codigo.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben estar completos",
        variant: "destructive",
      })
      return
    }

    const snippetActualizado: Snippet = {
      ...snippet,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      lenguaje,
      codigo: codigo.trim(),
      etiquetas,
      categoria,
      favorito,
      notas: notas.trim() || undefined,
      actualizadoEn: new Date().toISOString(),
    }

    guardarSnippet(snippetActualizado)
    setSnippet(snippetActualizado)
    setEditando(false)

    toast({
      title: "¡Snippet actualizado!",
      description: "Los cambios se guardaron exitosamente",
      variant: "success",
    })
  }

  const manejarEliminar = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este snippet?")) {
      eliminarSnippet(id)

      toast({
        title: "Snippet eliminado",
        description: "El snippet se eliminó permanentemente",
        variant: "success",
      })

      router.push("/")
    }
  }

  const formatearFecha = (fechaString: string) => {
    return new Date(fechaString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const obtenerIconoAccion = (accion: string) => {
    switch (accion) {
      case "creado":
        return "✨"
      case "editado":
        return "✏️"
      case "usado":
        return "📋"
      default:
        return "📝"
    }
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Snippet no encontrado</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const categoriaActual = categorias.find((c) => c.id === snippet.categoria)

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
            {editando ? (
              <h1 className="text-2xl font-bold">Editar Snippet</h1>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{snippet.titulo}</h1>
                  {snippet.favorito && <Star className="h-6 w-6 text-yellow-500 fill-current" />}
                </div>
                {snippet.descripcion && <p className="text-gray-600 mt-1">{snippet.descripcion}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {editando ? (
              <>
                <Button variant="outline" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
                <Button onClick={manejarGuardar}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMostrarHistorial(!mostrarHistorial)}
                  className="bg-transparent"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </Button>
                <Button variant="outline" onClick={() => setEditando(true)} className="bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={manejarEliminar} className="text-red-600 bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>

        {mostrarHistorial && !editando && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snippet.historial.map((cambio) => (
                  <div key={cambio.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <span className="text-lg">{obtenerIconoAccion(cambio.accion)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cambio.descripcion}</p>
                      <p className="text-xs text-gray-500">{formatearFecha(cambio.fecha)}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {cambio.accion}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {editando ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lenguaje *</label>
                <Select value={lenguaje} onValueChange={setLenguaje}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGUAJES_SOPORTADOS.map((lang) => (
                      <SelectItem key={lang} value={lang} className="capitalize">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Etiquetas</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={entradaEtiqueta}
                    onChange={(e) => setEntradaEtiqueta(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        agregarEtiqueta()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={agregarEtiqueta} disabled={!entradaEtiqueta}>
                    Añadir
                  </Button>
                </div>
                {etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {etiquetas.map((etiqueta) => (
                      <Badge key={etiqueta} className="flex items-center gap-1">
                        {etiqueta}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => quitarEtiqueta(etiqueta)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="favorito" checked={favorito} onCheckedChange={setFavorito} />
                <Label htmlFor="favorito">Marcar como favorito</Label>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Código *</label>
                <EditorMonacoReact
                  codigo={codigo}
                  lenguaje={lenguaje}
                  alCambiar={setCodigo}
                  altura="500px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{snippet.lenguaje}</span>
                    <Badge style={{ backgroundColor: categoriaActual?.color }} className="text-white">
                      {categoriaActual?.nombre}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EditorMonacoReact codigo={snippet.codigo} lenguaje={snippet.lenguaje} soloLectura />
                </CardContent>
              </Card>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Etiquetas</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {snippet.etiquetas.map((etiqueta) => (
                    <Badge key={etiqueta}>{etiqueta}</Badge>
                  ))}
                </div>
              </div>
              {snippet.notas && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Notas</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{snippet.notas}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Usado: {snippet.vecesUsado} veces</p>
                  <p>Último uso: {snippet.ultimoUso ? formatearFecha(snippet.ultimoUso) : "Nunca"}</p>
                  <p>Creado: {formatearFecha(snippet.creadoEn)}</p>
                  <p>Actualizado: {formatearFecha(snippet.actualizadoEn)}</p>
                </CardContent>
              </Card>

              <AICodeAssistant snippet={snippet} />
              <CodeCollaboration snippet={snippet} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 