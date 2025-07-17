"use client"

export interface Snippet {
  id: string
  titulo: string
  descripcion?: string
  lenguaje: string
  codigo: string
  etiquetas: string[]
  categoria: string
  favorito: boolean
  notas?: string
  vecesUsado: number
  ultimoUso?: string
  creadoEn: string
  actualizadoEn: string
  historial: HistorialCambio[]
}

export interface HistorialCambio {
  id: string
  fecha: string
  accion: "creado" | "editado" | "usado"
  descripcion: string
}

export interface Categoria {
  id: string
  nombre: string
  color: string
  descripcion?: string
}

export interface FiltrosBusqueda {
  consulta: string
  lenguaje: string
  etiquetas: string[]
  categoria: string
  soloFavoritos: boolean
  busquedaRegex: boolean
}

export interface Estadisticas {
  totalSnippets: number
  snippetsPorLenguaje: Record<string, number>
  snippetsPorCategoria: Record<string, number>
  masUsados: Snippet[]
  recientes: Snippet[]
}

export interface ConfiguracionApp {
  tema: "claro" | "oscuro" | "auto"
  idioma: "es" | "en"
  mostrarLineaNumeros: boolean
  tamanioFuente: number
  autoguardado: boolean
}

export const LENGUAJES_SOPORTADOS = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "java",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "sql",
  "json",
  "yaml",
  "markdown",
  "bash",
  "powershell",
  "swift",
  "kotlin",
  "dart",
  "vue",
  "react",
  "angular",
] as const

export type LenguajeSoportado = (typeof LENGUAJES_SOPORTADOS)[number]

export const CATEGORIAS_PREDETERMINADAS: Categoria[] = [
  { id: "general", nombre: "General", color: "#6B7280", descripcion: "Snippets generales" },
  { id: "frontend", nombre: "Frontend", color: "#3B82F6", descripcion: "HTML, CSS, JavaScript" },
  { id: "backend", nombre: "Backend", color: "#10B981", descripcion: "APIs, servidores, bases de datos" },
  { id: "utilidades", nombre: "Utilidades", color: "#F59E0B", descripcion: "Funciones útiles y helpers" },
  { id: "algoritmos", nombre: "Algoritmos", color: "#8B5CF6", descripcion: "Algoritmos y estructuras de datos" },
  { id: "configuracion", nombre: "Configuración", color: "#EF4444", descripcion: "Archivos de configuración" },
]

export const PLANTILLAS_PREDEFINIDAS = [
  {
    titulo: "Función Async/Await",
    lenguaje: "javascript",
    codigo: `async function miFuncion() {
  try {
    const resultado = await fetch('/api/datos');
    const datos = await resultado.json();
    return datos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`,
    etiquetas: ["async", "fetch", "javascript"],
    categoria: "utilidades",
  },
  {
    titulo: "Componente React Básico",
    lenguaje: "react",
    codigo: `import React, { useState, useEffect } from 'react';

const MiComponente = ({ prop1, prop2 }) => {
  const [estado, setEstado] = useState('');

  useEffect(() => {
    // Efecto secundario
  }, []);

  return (
    <div>
      <h1>{prop1}</h1>
      <p>{estado}</p>
    </div>
  );
};

export default MiComponente;`,
    etiquetas: ["react", "componente", "hooks"],
    categoria: "frontend",
  },
  {
    titulo: "Validación de Email",
    lenguaje: "javascript",
    codigo: `function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Uso
const esValido = validarEmail('usuario@ejemplo.com');`,
    etiquetas: ["validacion", "email", "regex"],
    categoria: "utilidades",
  },
]
