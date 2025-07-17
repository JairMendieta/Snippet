"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Eye, EyeOff } from "lucide-react"
import { obtenerConfiguracion } from "@/lib/storage"

interface EditorSnippetProps {
  codigo: string
  lenguaje: string
  onChange?: (codigo: string) => void
  soloLectura?: boolean
  altura?: string
  mostrarNumeros?: boolean
}

export function EditorSnippet({
  codigo,
  lenguaje,
  onChange,
  soloLectura = false,
  altura = "400px",
  mostrarNumeros,
}: EditorSnippetProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiado, setCopiado] = useState(false)
  const [mostrarLineaNumeros, setMostrarLineaNumeros] = useState(mostrarNumeros ?? true)
  const [config, setConfig] = useState(obtenerConfiguracion())

  useEffect(() => {
    setConfig(obtenerConfiguracion())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && editorRef.current) {
      const textarea = document.createElement("textarea")
      textarea.value = codigo
      textarea.readOnly = soloLectura
      textarea.className = `
        w-full h-full p-4 font-mono bg-gray-900 text-gray-100 
        border-0 outline-none resize-none rounded-md
        ${mostrarLineaNumeros ? "pl-12" : "pl-4"}
      `
      textarea.style.height = altura
      textarea.style.fontSize = `${config.tamanioFuente}px`
      textarea.style.lineHeight = "1.5"
      textarea.style.tabSize = "2"

      if (onChange && !soloLectura) {
        textarea.addEventListener("input", (e) => {
          onChange((e.target as HTMLTextAreaElement).value)
        })
      }

      // Manejar Tab para indentación
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          textarea.value = textarea.value.substring(0, start) + "  " + textarea.value.substring(end)
          textarea.selectionStart = textarea.selectionEnd = start + 2
          if (onChange) onChange(textarea.value)
        }
      })

      editorRef.current.innerHTML = ""
      editorRef.current.appendChild(textarea)
      textareaRef.current = textarea

      // Crear números de línea si están habilitados
      if (mostrarLineaNumeros) {
        crearNumerosLinea()
      }
    }
  }, [codigo, lenguaje, onChange, soloLectura, altura, mostrarLineaNumeros, config.tamanioFuente])

  const crearNumerosLinea = () => {
    if (!textareaRef.current || !editorRef.current) return

    const lineas = codigo.split("\n").length
    const numerosDiv = document.createElement("div")
    numerosDiv.className =
      "absolute left-0 top-0 p-4 pr-2 text-gray-500 font-mono text-right select-none pointer-events-none"
    numerosDiv.style.fontSize = `${config.tamanioFuente}px`
    numerosDiv.style.lineHeight = "1.5"
    numerosDiv.style.width = "40px"

    for (let i = 1; i <= lineas; i++) {
      const lineaSpan = document.createElement("div")
      lineaSpan.textContent = i.toString()
      numerosDiv.appendChild(lineaSpan)
    }

    // Remover números anteriores
    const numerosAnteriores = editorRef.current.querySelector(".absolute")
    if (numerosAnteriores) {
      numerosAnteriores.remove()
    }

    editorRef.current.style.position = "relative"
    editorRef.current.appendChild(numerosDiv)
  }

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      console.error("Error al copiar:", error)
    }
  }

  const alternarNumerosLinea = () => {
    setMostrarLineaNumeros(!mostrarLineaNumeros)
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 capitalize font-medium">{lenguaje}</span>
          <span className="text-xs text-gray-500">
            {codigo.split("\n").length} líneas • {codigo.length} caracteres
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={alternarNumerosLinea}
            className="flex items-center gap-2 bg-transparent"
          >
            {mostrarLineaNumeros ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copiarAlPortapapeles}
            className="flex items-center gap-2 bg-transparent"
          >
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "¡Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>
      <div ref={editorRef} className="border rounded-md overflow-hidden" style={{ height: altura }} />
    </div>
  )
}
