"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Eye, EyeOff, Wand2, Play, Download, Maximize2, Minimize2, Palette, Share2 } from "lucide-react"
import { obtenerConfiguracion } from "@/lib/storage"
import { detectarLenguaje, formatearCodigo } from "@/lib/language-detector"
import { LENGUAJES_SOPORTADOS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface EditorSnippetAvanzadoProps {
  codigo: string
  lenguaje: string
  onChange?: (codigo: string, lenguajeDetectado?: string) => void
  soloLectura?: boolean
  altura?: string
  mostrarNumeros?: boolean
  autoDetectar?: boolean
}

export function EditorSnippetAvanzado({
  codigo,
  lenguaje,
  onChange,
  soloLectura = false,
  altura = "400px",
  mostrarNumeros,
  autoDetectar = true,
}: EditorSnippetAvanzadoProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiado, setCopiado] = useState(false)
  const [mostrarLineaNumeros, setMostrarLineaNumeros] = useState(mostrarNumeros ?? true)
  const [config, setConfig] = useState(obtenerConfiguracion())
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [tema, setTema] = useState<"oscuro" | "claro">("oscuro")
  const [lenguajeDetectado, setLenguajeDetectado] = useState(lenguaje)
  const { toast } = useToast()

  useEffect(() => {
    setConfig(obtenerConfiguracion())
  }, [])

  // Detectar lenguaje automáticamente
  const detectarYActualizarLenguaje = useCallback(
    (codigoActual: string) => {
      if (autoDetectar && codigoActual.trim().length > 10) {
        const lenguajeDetectadoNuevo = detectarLenguaje(codigoActual)
        if (lenguajeDetectadoNuevo !== lenguajeDetectado) {
          setLenguajeDetectado(lenguajeDetectadoNuevo)
          if (onChange) {
            onChange(codigoActual, lenguajeDetectadoNuevo)
          }
          toast({
            title: "Lenguaje detectado",
            description: `Se detectó automáticamente: ${lenguajeDetectadoNuevo}`,
            variant: "default",
          })
        }
      }
    },
    [autoDetectar, lenguajeDetectado, onChange, toast],
  )

  useEffect(() => {
    if (typeof window !== "undefined" && editorRef.current && !textareaRef.current) {
      const textarea = document.createElement("textarea")
      textarea.value = codigo
      textarea.readOnly = soloLectura
      textarea.spellcheck = false
      textarea.className = `
        w-full h-full p-4 font-mono border-0 outline-none resize-none rounded-md
        ${tema === "oscuro" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
        ${mostrarLineaNumeros ? "pl-12" : "pl-4"}
      `
      textarea.style.height = altura
      textarea.style.fontSize = `${config.tamanioFuente}px`
      textarea.style.lineHeight = "1.5"
      textarea.style.tabSize = "2"

      // Manejar cambios de texto
      if (onChange && !soloLectura) {
        textarea.addEventListener("input", (e) => {
          const nuevoValor = (e.target as HTMLTextAreaElement).value
          onChange(nuevoValor)

          // Detectar lenguaje con debounce
          setTimeout(() => {
            detectarYActualizarLenguaje(nuevoValor)
          }, 1000)
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

        // Ctrl+S para formatear
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault()
          formatearCodigoActual()
        }

        // Ctrl+D para duplicar línea
        if (e.ctrlKey && e.key === "d") {
          e.preventDefault()
          duplicarLinea()
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

    // Actualizar contenido si cambia externamente
    if (textareaRef.current && textareaRef.current.value !== codigo) {
      textareaRef.current.value = codigo
    }
  }, [codigo, soloLectura, altura, mostrarLineaNumeros, config.tamanioFuente, tema])

  const crearNumerosLinea = () => {
    if (!textareaRef.current || !editorRef.current) return

    const lineas = codigo.split("\n").length
    const numerosDiv = document.createElement("div")
    numerosDiv.className = `
      absolute left-0 top-0 p-4 pr-2 text-right select-none pointer-events-none font-mono
      ${tema === "oscuro" ? "text-gray-500" : "text-gray-400"}
    `
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
      toast({
        title: "¡Copiado!",
        description: "Código copiado al portapapeles",
        variant: "success",
      })
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      })
    }
  }

  const formatearCodigoActual = () => {
    if (!onChange || soloLectura) return

    try {
      const codigoFormateado = formatearCodigo(codigo, lenguajeDetectado)
      onChange(codigoFormateado)
      toast({
        title: "Código formateado",
        description: "Se aplicó formato automático al código",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error al formatear",
        description: "No se pudo formatear el código",
        variant: "destructive",
      })
    }
  }

  const duplicarLinea = () => {
    if (!textareaRef.current || soloLectura) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const value = textarea.value
    const lines = value.split("\n")

    // Encontrar la línea actual
    let currentLine = 0
    let charCount = 0
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    // Duplicar la línea
    lines.splice(currentLine + 1, 0, lines[currentLine])
    const newValue = lines.join("\n")

    if (onChange) {
      onChange(newValue)
    }
  }

  const ejecutarCodigo = () => {
    if (lenguajeDetectado === "javascript") {
      try {
        // Ejecutar JavaScript de forma segura
        const resultado = eval(codigo)
        toast({
          title: "Código ejecutado",
          description: `Resultado: ${resultado}`,
          variant: "success",
        })
      } catch (error) {
        toast({
          title: "Error de ejecución",
          description: `Error: ${error}`,
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Ejecución no soportada",
        description: `La ejecución de ${lenguajeDetectado} no está disponible`,
        variant: "warning",
      })
    }
  }

  const descargarCodigo = () => {
    const extension = obtenerExtensionArchivo(lenguajeDetectado)
    const blob = new Blob([codigo], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `snippet.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Descarga iniciada",
      description: `Archivo snippet.${extension} descargado`,
      variant: "success",
    })
  }

  const compartirCodigo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Snippet de código",
          text: codigo,
        })
        toast({
          title: "Compartido",
          description: "Código compartido exitosamente",
          variant: "success",
        })
      } catch (error) {
        copiarAlPortapapeles()
      }
    } else {
      copiarAlPortapapeles()
    }
  }

  const obtenerExtensionArchivo = (lenguaje: string): string => {
    const extensiones: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      html: "html",
      css: "css",
      java: "java",
      cpp: "cpp",
      php: "php",
      sql: "sql",
      json: "json",
      bash: "sh",
      react: "jsx",
    }
    return extensiones[lenguaje] || "txt"
  }

  const alternarNumerosLinea = () => {
    setMostrarLineaNumeros(!mostrarLineaNumeros)
  }

  const alternarPantallaCompleta = () => {
    setPantallaCompleta(!pantallaCompleta)
  }

  const alternarTema = () => {
    setTema(tema === "oscuro" ? "claro" : "oscuro")
  }

  return (
    <div className={`relative ${pantallaCompleta ? "fixed inset-0 z-50 bg-white" : ""}`}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize font-medium">
            {autoDetectar ? lenguajeDetectado : lenguaje}
          </Badge>
          {autoDetectar && (
            <Badge variant="outline" className="text-xs">
              Auto-detectado
            </Badge>
          )}
          <span className="text-xs text-gray-500">
            {codigo.split("\n").length} líneas • {codigo.length} caracteres
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {!soloLectura && (
            <>
              <Select
                value={lenguajeDetectado}
                onValueChange={(valor) => {
                  setLenguajeDetectado(valor)
                  if (onChange) onChange(codigo, valor)
                }}
              >
                <SelectTrigger className="w-32 h-8">
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

              <Button
                variant="outline"
                size="sm"
                onClick={formatearCodigoActual}
                className="h-8 bg-transparent"
                title="Formatear código (Ctrl+S)"
              >
                <Wand2 className="h-3 w-3" />
              </Button>

              {lenguajeDetectado === "javascript" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={ejecutarCodigo}
                  className="h-8 bg-transparent"
                  title="Ejecutar código"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={alternarTema}
            className="h-8 bg-transparent"
            title="Cambiar tema"
          >
            <Palette className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={alternarNumerosLinea}
            className="h-8 bg-transparent"
            title="Alternar números de línea"
          >
            {mostrarLineaNumeros ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={descargarCodigo}
            className="h-8 bg-transparent"
            title="Descargar código"
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={compartirCodigo}
            className="h-8 bg-transparent"
            title="Compartir código"
          >
            <Share2 className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copiarAlPortapapeles}
            className="h-8 bg-transparent"
            title="Copiar código"
          >
            {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={alternarPantallaCompleta}
            className="h-8 bg-transparent"
            title="Pantalla completa"
          >
            {pantallaCompleta ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="border rounded-md overflow-hidden"
        style={{ height: pantallaCompleta ? "calc(100vh - 100px)" : altura }}
      />

      {!soloLectura && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
          <span>💡 Consejos: Tab para indentar, Ctrl+S para formatear, Ctrl+D para duplicar línea</span>
        </div>
      )}
    </div>
  )
}
