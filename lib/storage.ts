import type { Snippet, Categoria, ConfiguracionApp, HistorialCambio } from "./types"
import { CATEGORIAS_PREDETERMINADAS } from "./types"

const STORAGE_KEYS = {
  snippets: "gestor-snippets",
  categorias: "gestor-categorias",
  configuracion: "gestor-configuracion",
}

export function obtenerSnippets(): Snippet[] {
  if (typeof window === "undefined") return []

  try {
    const almacenados = localStorage.getItem(STORAGE_KEYS.snippets)
    return almacenados ? JSON.parse(almacenados) : []
  } catch (error) {
    console.error("Error cargando snippets:", error)
    return []
  }
}

export function guardarSnippets(snippets: Snippet[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.snippets, JSON.stringify(snippets))
  } catch (error) {
    console.error("Error guardando snippets:", error)
  }
}

export function guardarSnippet(snippet: Snippet): void {
  const snippets = obtenerSnippets()
  const indiceExistente = snippets.findIndex((s) => s.id === snippet.id)

  const cambio: HistorialCambio = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    accion: indiceExistente >= 0 ? "editado" : "creado",
    descripcion: indiceExistente >= 0 ? "Snippet editado" : "Snippet creado",
  }

  if (indiceExistente >= 0) {
    snippets[indiceExistente] = {
      ...snippet,
      actualizadoEn: new Date().toISOString(),
      historial: [...snippet.historial, cambio],
    }
  } else {
    snippets.push({
      ...snippet,
      historial: [cambio],
    })
  }

  guardarSnippets(snippets)
}

export function eliminarSnippet(id: string): void {
  const snippets = obtenerSnippets()
  const filtrados = snippets.filter((s) => s.id !== id)
  guardarSnippets(filtrados)
}

export function obtenerSnippetPorId(id: string): Snippet | undefined {
  const snippets = obtenerSnippets()
  return snippets.find((s) => s.id === id)
}

export function duplicarSnippet(id: string): Snippet | null {
  const snippet = obtenerSnippetPorId(id)
  if (!snippet) return null

  const duplicado: Snippet = {
    ...snippet,
    id: crypto.randomUUID(),
    titulo: `${snippet.titulo} (Copia)`,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    vecesUsado: 0,
    historial: [
      {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        accion: "creado",
        descripcion: "Snippet duplicado",
      },
    ],
  }

  guardarSnippet(duplicado)
  return duplicado
}

export function marcarComoUsado(id: string): void {
  const snippets = obtenerSnippets()
  const snippet = snippets.find((s) => s.id === id)

  if (snippet) {
    snippet.vecesUsado += 1
    snippet.ultimoUso = new Date().toISOString()
    snippet.historial.push({
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      accion: "usado",
      descripcion: "Snippet copiado/usado",
    })
    guardarSnippets(snippets)
  }
}

export function alternarFavorito(id: string): void {
  const snippets = obtenerSnippets()
  const snippet = snippets.find((s) => s.id === id)

  if (snippet) {
    snippet.favorito = !snippet.favorito
    snippet.actualizadoEn = new Date().toISOString()
    guardarSnippets(snippets)
  }
}

// Gestión de categorías
export function obtenerCategorias(): Categoria[] {
  if (typeof window === "undefined") return CATEGORIAS_PREDETERMINADAS

  try {
    const almacenadas = localStorage.getItem(STORAGE_KEYS.categorias)
    return almacenadas ? JSON.parse(almacenadas) : CATEGORIAS_PREDETERMINADAS
  } catch (error) {
    console.error("Error cargando categorías:", error)
    return CATEGORIAS_PREDETERMINADAS
  }
}

export function guardarCategorias(categorias: Categoria[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.categorias, JSON.stringify(categorias))
  } catch (error) {
    console.error("Error guardando categorías:", error)
  }
}

// Configuración
export function obtenerConfiguracion(): ConfiguracionApp {
  if (typeof window === "undefined")
    return {
      tema: "auto",
      idioma: "es",
      mostrarLineaNumeros: true,
      tamanioFuente: 14,
      autoguardado: true,
    }

  try {
    const almacenada = localStorage.getItem(STORAGE_KEYS.configuracion)
    return almacenada
      ? JSON.parse(almacenada)
      : {
          tema: "auto",
          idioma: "es",
          mostrarLineaNumeros: true,
          tamanioFuente: 14,
          autoguardado: true,
        }
  } catch (error) {
    console.error("Error cargando configuración:", error)
    return {
      tema: "auto",
      idioma: "es",
      mostrarLineaNumeros: true,
      tamanioFuente: 14,
      autoguardado: true,
    }
  }
}

export function guardarConfiguracion(config: ConfiguracionApp): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.configuracion, JSON.stringify(config))
  } catch (error) {
    console.error("Error guardando configuración:", error)
  }
}

// Exportar/Importar
export function exportarSnippets(): string {
  const snippets = obtenerSnippets()
  const categorias = obtenerCategorias()
  const configuracion = obtenerConfiguracion()

  return JSON.stringify(
    {
      snippets,
      categorias,
      configuracion,
      exportadoEn: new Date().toISOString(),
      version: "1.0",
    },
    null,
    2,
  )
}

export function importarSnippets(datosJson: string): boolean {
  try {
    const datos = JSON.parse(datosJson)

    if (datos.snippets) {
      guardarSnippets(datos.snippets)
    }

    if (datos.categorias) {
      guardarCategorias(datos.categorias)
    }

    if (datos.configuracion) {
      guardarConfiguracion(datos.configuracion)
    }

    return true
  } catch (error) {
    console.error("Error importando datos:", error)
    return false
  }
}
