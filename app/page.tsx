"use client"

import { useState, useEffect } from "react"
import type { Snippet, Estadisticas } from "@/lib/types"
import { obtenerSnippets, eliminarSnippet, duplicarSnippet, alternarFavorito, obtenerCategorias } from "@/lib/storage"
import { TarjetaSnippet } from "@/components/tarjeta-snippet"
import { FiltrosBusqueda } from "@/components/filtros-busqueda"
import { EstadisticasDashboard } from "@/components/estadisticas-dashboard"
import { Button } from "@/components/ui/button"
import { Plus, Code2, Settings, Filter, Grid, List } from "lucide-react"
import Link from "next/link"
import { useAlert } from "@/hooks/use-alert"

export default function PaginaInicio() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [snippetsFiltrados, setSnippetsFiltrados] = useState<Snippet[]>([])
  const [consulta, setConsulta] = useState("")
  const [lenguaje, setLenguaje] = useState("")
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [categoria, setCategoria] = useState("")
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [busquedaRegex, setBusquedaRegex] = useState(false)
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<string[]>([])
  const [ordenamiento, setOrdenamiento] = useState<"reciente" | "antiguo" | "nombre" | "usado">("reciente")
  const [vistaGrid, setVistaGrid] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalSnippets: 0,
    snippetsPorLenguaje: {},
    snippetsPorCategoria: {},
    masUsados: [],
    recientes: [],
  })
  const [categorias, setCategorias] = useState(obtenerCategorias())
  const { showAlert } = useAlert()

  useEffect(() => {
    const snippetsCargados = obtenerSnippets()
    setSnippets(snippetsCargados)
    setCategorias(obtenerCategorias())

    // Extraer todas las etiquetas únicas
    const todasEtiquetas = snippetsCargados.flatMap((s) => s.etiquetas)
    const etiquetasUnicas = Array.from(new Set(todasEtiquetas)).sort()
    setEtiquetasDisponibles(etiquetasUnicas)

    // Calcular estadísticas
    calcularEstadisticas(snippetsCargados)
  }, [])

  const calcularEstadisticas = (snippets: Snippet[]) => {
    const snippetsPorLenguaje: Record<string, number> = {}
    const snippetsPorCategoria: Record<string, number> = {}

    snippets.forEach((snippet) => {
      snippetsPorLenguaje[snippet.lenguaje] = (snippetsPorLenguaje[snippet.lenguaje] || 0) + 1
      snippetsPorCategoria[snippet.categoria] = (snippetsPorCategoria[snippet.categoria] || 0) + 1
    })

    const masUsados = [...snippets].sort((a, b) => b.vecesUsado - a.vecesUsado).slice(0, 5)

    const recientes = [...snippets]
      .sort((a, b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime())
      .slice(0, 5)

    setEstadisticas({
      totalSnippets: snippets.length,
      snippetsPorLenguaje,
      snippetsPorCategoria,
      masUsados,
      recientes,
    })
  }

  useEffect(() => {
    let filtrados = snippets

    // Filtrar por consulta
    if (consulta) {
      if (busquedaRegex) {
        try {
          const regex = new RegExp(consulta, "i")
          filtrados = filtrados.filter(
            (snippet) =>
              regex.test(snippet.titulo) || regex.test(snippet.descripcion || "") || regex.test(snippet.codigo),
          )
        } catch (error) {
          // Si la regex es inválida, usar búsqueda normal
          filtrados = filtrados.filter(
            (snippet) =>
              snippet.titulo.toLowerCase().includes(consulta.toLowerCase()) ||
              snippet.descripcion?.toLowerCase().includes(consulta.toLowerCase()) ||
              snippet.codigo.toLowerCase().includes(consulta.toLowerCase()),
          )
        }
      } else {
        filtrados = filtrados.filter(
          (snippet) =>
            snippet.titulo.toLowerCase().includes(consulta.toLowerCase()) ||
            snippet.descripcion?.toLowerCase().includes(consulta.toLowerCase()) ||
            snippet.codigo.toLowerCase().includes(consulta.toLowerCase()) ||
            snippet.etiquetas.some((etiqueta) => etiqueta.toLowerCase().includes(consulta.toLowerCase())),
        )
      }
    }

    // Filtrar por lenguaje
    if (lenguaje) {
      filtrados = filtrados.filter((snippet) => snippet.lenguaje === lenguaje)
    }

    // Filtrar por categoría
    if (categoria) {
      filtrados = filtrados.filter((snippet) => snippet.categoria === categoria)
    }

    // Filtrar por etiquetas
    if (etiquetas.length > 0) {
      filtrados = filtrados.filter((snippet) => etiquetas.every((etiqueta) => snippet.etiquetas.includes(etiqueta)))
    }

    // Filtrar solo favoritos
    if (soloFavoritos) {
      filtrados = filtrados.filter((snippet) => snippet.favorito)
    }

    // Ordenar
    switch (ordenamiento) {
      case "reciente":
        filtrados.sort((a, b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime())
        break
      case "antiguo":
        filtrados.sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())
        break
      case "nombre":
        filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
      case "usado":
        filtrados.sort((a, b) => b.vecesUsado - a.vecesUsado)
        break
    }

    setSnippetsFiltrados(filtrados)
  }, [snippets, consulta, lenguaje, etiquetas, categoria, soloFavoritos, busquedaRegex, ordenamiento])

  const manejarEliminar = (id: string) => {
    const snippet = snippets.find((s) => s.id === id)

    showAlert({
      title: "Eliminar Snippet",
      description: `¿Estás seguro de que quieres eliminar "${snippet?.titulo}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: () => {
        eliminarSnippet(id)
        const nuevosSnippets = obtenerSnippets()
        setSnippets(nuevosSnippets)
        calcularEstadisticas(nuevosSnippets)
      },
      onCancel: () => {},
    })
  }

  const manejarDuplicar = (id: string) => {
    const duplicado = duplicarSnippet(id)
    if (duplicado) {
      const nuevosSnippets = obtenerSnippets()
      setSnippets(nuevosSnippets)
      calcularEstadisticas(nuevosSnippets)
    }
  }

  const manejarAlternarFavorito = (id: string) => {
    alternarFavorito(id)
    const nuevosSnippets = obtenerSnippets()
    setSnippets(nuevosSnippets)
    calcularEstadisticas(nuevosSnippets)
  }

  const limpiarTodosFiltros = () => {
    setConsulta("")
    setLenguaje("")
    setEtiquetas([])
    setCategoria("")
    setSoloFavoritos(false)
    setBusquedaRegex(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Code2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestor de Snippets</h1>
              <p className="text-gray-600">Tu cofre de trucos de programación personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/plantillas">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Code2 className="h-4 w-4" />
                Plantillas
              </Button>
            </Link>
            <Link href="/configuracion">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
            </Link>
            <Link href="/nuevo">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Snippet
              </Button>
            </Link>
          </div>
        </div>

        <EstadisticasDashboard estadisticas={estadisticas} categorias={categorias} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="reciente">Más reciente</option>
              <option value="antiguo">Más antiguo</option>
              <option value="nombre">Por nombre</option>
              <option value="usado">Más usado</option>
            </select>

            <Button variant="outline" size="sm" onClick={limpiarTodosFiltros} className="bg-transparent">
              Limpiar filtros
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setVistaGrid(!vistaGrid)} className="bg-transparent">
              {vistaGrid ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mostrarFiltros && (
          <FiltrosBusqueda
            consulta={consulta}
            lenguaje={lenguaje}
            etiquetas={etiquetas}
            categoria={categoria}
            soloFavoritos={soloFavoritos}
            busquedaRegex={busquedaRegex}
            etiquetasDisponibles={etiquetasDisponibles}
            categorias={categorias}
            onCambioConsulta={setConsulta}
            onCambioLenguaje={setLenguaje}
            onCambioEtiquetas={setEtiquetas}
            onCambioCategoria={setCategoria}
            onCambioSoloFavoritos={setSoloFavoritos}
            onCambioBusquedaRegex={setBusquedaRegex}
          />
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {snippetsFiltrados.length} snippet{snippetsFiltrados.length !== 1 ? "s" : ""}
              {soloFavoritos && " favoritos"}
            </h2>
          </div>

          {snippetsFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {snippets.length === 0 ? "Aún no tienes snippets" : "No hay snippets que coincidan con tus filtros"}
              </h3>
              <p className="text-gray-600 mb-4">
                {snippets.length === 0
                  ? "Crea tu primer snippet de código para comenzar"
                  : "Intenta ajustar tus criterios de búsqueda"}
              </p>
              {snippets.length === 0 && (
                <div className="flex items-center justify-center gap-4">
                  <Link href="/nuevo">
                    <Button>Crear Primer Snippet</Button>
                  </Link>
                  <Link href="/plantillas">
                    <Button variant="outline">Ver Plantillas</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {snippetsFiltrados.map((snippet) => (
                <TarjetaSnippet
                  key={snippet.id}
                  snippet={snippet}
                  onEliminar={manejarEliminar}
                  onDuplicar={manejarDuplicar}
                  onAlternarFavorito={manejarAlternarFavorito}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
