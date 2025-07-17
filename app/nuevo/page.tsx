"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Snippet, LENGUAJES_SOPORTADOS } from "@/lib/types"
import { guardarSnippet, obtenerCategorias } from "@/lib/storage"
import { EditorMonacoReact } from "@/components/editor-monaco-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PaginaNuevoSnippet() {
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [lenguaje, setLenguaje] = useState("javascript")
  const [codigo, setCodigo] = useState(`// ¡Bienvenido al editor Monaco!
// Este es un editor de código profesional con todas las funciones

function saludar(nombre) {
  console.log(\`¡Hola, \${nombre}!\`);
  return \`Bienvenido al gestor de snippets\`;
}

// Prueba el autocompletado escribiendo "console." o "document."
const resultado = saludar("Desarrollador");
console.log(resultado);

// Características disponibles:
// - Coloración de sintaxis completa
// - Autocompletado inteligente  
// - Formateo automático (Ctrl+S)
// - Detección automática de lenguaje
// - Temas claro/oscuro
// - Y mucho más...`)
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [categoria, setCategoria] = useState("general")
  const [favorito, setFavorito] = useState(false)
  const [notas, setNotas] = useState("")
  const [entradaEtiqueta, setEntradaEtiqueta] = useState("")

  const categorias = obtenerCategorias()
  const { toast } = useToast()

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
    if (!titulo.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un título para tu snippet",
        variant: "destructive",
      })
      return
    }

    if (!codigo.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa algo de código",
        variant: "destructive",
      })
      return
    }

    const snippet: Snippet = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      lenguaje,
      codigo: codigo.trim(),
      etiquetas,
      categoria,
      favorito,
      notas: notas.trim() || undefined,
      vecesUsado: 0,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      historial: [],
    }

    guardarSnippet(snippet)

    toast({
      title: "¡Snippet creado!",
      description: `El snippet "${titulo}" se guardó exitosamente`,
      variant: "success",
    })

    router.push("/")
  }

  const etiquetasSugeridas = [
    "frontend",
    "backend",
    "utilidad",
    "algoritmo",
    "api",
    "database",
    "react",
    "vue",
    "angular",
    "node",
  ]

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
            <h1 className="text-2xl font-bold">Crear Nuevo Snippet</h1>
          </div>
          <Button onClick={manejarGuardar} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Snippet
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ingresa el título del snippet..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.nombre}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Etiquetas</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={entradaEtiqueta}
                  onChange={(e) => setEntradaEtiqueta(e.target.value)}
                  placeholder="Agregar etiqueta..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      agregarEtiqueta()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={agregarEtiqueta} disabled={!entradaEtiqueta}>
                  Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-sm text-gray-600 mr-2">Sugerencias:</span>
                {etiquetasSugeridas.map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      if (!etiquetas.includes(etiqueta)) {
                        setEtiquetas([...etiquetas, etiqueta])
                      }
                    }}
                  >
                    {etiqueta}
                  </Badge>
                ))}
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

            <div>
              <label className="block text-sm font-medium mb-2">Notas adicionales</label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas, recordatorios o contexto adicional..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="favorito" checked={favorito} onCheckedChange={setFavorito} />
              <Label htmlFor="favorito" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Marcar como favorito
              </Label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Código *</label>
            <EditorMonacoReact
              codigo={codigo}
              lenguaje={lenguaje}
              onChange={(nuevoCodigo, lenguajeDetectado) => {
                setCodigo(nuevoCodigo)
                if (lenguajeDetectado) {
                  setLenguaje(lenguajeDetectado)
                }
              }}
              altura="600px"
              autoDetectar={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
