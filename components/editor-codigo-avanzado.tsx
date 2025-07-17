"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Wand2,
  Play,
  Download,
  Maximize2,
  Minimize2,
  Palette,
  Share2,
  Settings,
  Zap,
  Code,
} from "lucide-react"
import { obtenerConfiguracion } from "@/lib/storage"
import { detectarLenguaje, formatearCodigo } from "@/lib/language-detector"
import { LENGUAJES_SOPORTADOS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface EditorCodigoAvanzadoProps {
  codigo: string
  lenguaje: string
  onChange?: (codigo: string, lenguajeDetectado?: string) => void
  soloLectura?: boolean
  altura?: string
  mostrarNumeros?: boolean
  autoDetectar?: boolean
}

export function EditorCodigoAvanzado({
  codigo,
  lenguaje,
  onChange,
  soloLectura = false,
  altura = "400px",
  mostrarNumeros,
  autoDetectar = true,
}: EditorCodigoAvanzadoProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const monacoRef = useRef<any>(null)
  const [copiado, setCopiado] = useState(false)
  const [mostrarLineaNumeros, setMostrarLineaNumeros] = useState(mostrarNumeros ?? true)
  const [config, setConfig] = useState(obtenerConfiguracion())
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [tema, setTema] = useState<"oscuro" | "claro">("oscuro")
  const [lenguajeDetectado, setLenguajeDetectado] = useState(lenguaje)
  const [tipoEditor, setTipoEditor] = useState<"basico" | "monaco" | "cargando">("cargando")
  const [autocompletado, setAutocompletado] = useState(true)
  const [minimap, setMinimap] = useState(false)
  const { toast } = useToast()

  // Intentar cargar Monaco Editor de forma segura
  useEffect(() => {
    let mounted = true

    const intentarCargarMonaco = async () => {
      try {
        // Intentar cargar Monaco desde CDN
        if (typeof window !== "undefined" && !window.monaco) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js"
          script.onload = () => {
            if (!mounted) return // Configurar Monaco Loader
            ;(window as any).require.config({
              paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" },
            })
            ;(window as any).require(["vs/editor/editor.main"], () => {
              if (!mounted) return
              inicializarMonaco()
            })
          }
          script.onerror = () => {
            if (mounted) {
              console.warn("No se pudo cargar Monaco Editor, usando editor básico")
              inicializarEditorBasico()
            }
          }
          document.head.appendChild(script)

          // Timeout de seguridad
          setTimeout(() => {
            if (mounted && tipoEditor === "cargando") {
              console.warn("Timeout cargando Monaco, usando editor básico")
              inicializarEditorBasico()
            }
          }, 5000)
        } else if (window.monaco) {
          inicializarMonaco()
        } else {
          inicializarEditorBasico()
        }
      } catch (error) {
        console.warn("Error cargando Monaco:", error)
        if (mounted) {
          inicializarEditorBasico()
        }
      }
    }

    const inicializarMonaco = () => {
      if (!mounted || !editorRef.current || !window.monaco) return

      try {
        // Configurar tema oscuro
        window.monaco.editor.defineTheme("dark-theme", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6A9955", fontStyle: "italic" },
            { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
            { token: "function", foreground: "DCDCAA" },
            { token: "variable", foreground: "9CDCFE" },
          ],
          colors: {
            "editor.background": "#1E1E1E",
            "editor.foreground": "#D4D4D4",
            "editorLineNumber.foreground": "#858585",
          },
        })

        // Crear editor
        const editor = window.monaco.editor.create(editorRef.current, {
          value: codigo,
          language: mapearLenguaje(lenguajeDetectado),
          theme: tema === "oscuro" ? "dark-theme" : "vs",
          readOnly: soloLectura,
          fontSize: config.tamanioFuente,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          lineNumbers: mostrarLineaNumeros ? "on" : "off",
          minimap: { enabled: minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          folding: true,
          matchBrackets: "always",
          autoIndent: "full",
          quickSuggestions: autocompletado,
          suggestOnTriggerCharacters: autocompletado,
        })

        monacoRef.current = editor
        setTipoEditor("monaco")

        // Configurar eventos
        if (onChange && !soloLectura) {
          editor.onDidChangeModelContent(() => {
            const nuevoValor = editor.getValue()
            onChange(nuevoValor)
            setTimeout(() => detectarYActualizarLenguaje(nuevoValor), 1000)
          })
        }

        toast({
          title: "Monaco Editor cargado",
          description: "Editor avanzado con coloración de sintaxis activado",
          variant: "success",
        })
      } catch (error) {
        console.warn("Error inicializando Monaco:", error)
        inicializarEditorBasico()
      }
    }

    const inicializarEditorBasico = () => {
      if (!mounted || !editorRef.current) return

      setTipoEditor("basico")
      crearEditorBasico()

      toast({
        title: "Editor básico activado",
        description: "Editor funcional con resaltado básico",
        variant: "default",
      })
    }

    intentarCargarMonaco()

    return () => {
      mounted = false
      if (monacoRef.current) {
        try {
          monacoRef.current.dispose()
        } catch (error) {
          console.warn("Error disposing Monaco:", error)
        }
      }
    }
  }, [])

  const crearEditorBasico = () => {
    if (!editorRef.current) return

    const container = document.createElement("div")
    container.className = "relative w-full h-full"

    const textarea = document.createElement("textarea")
    textarea.value = codigo
    textarea.readOnly = soloLectura
    textarea.spellcheck = false
    textarea.className = `
      w-full h-full p-4 font-mono border-0 outline-none resize-none rounded-md
      ${tema === "oscuro" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
      ${mostrarLineaNumeros ? "pl-12" : "pl-4"}
    `
    textarea.style.fontSize = `${config.tamanioFuente}px`
    textarea.style.lineHeight = "1.5"
    textarea.style.tabSize = "2"

    // Manejar cambios
    if (onChange && !soloLectura) {
      textarea.addEventListener("input", (e) => {
        const nuevoValor = (e.target as HTMLTextAreaElement).value
        onChange(nuevoValor)
        setTimeout(() => detectarYActualizarLenguaje(nuevoValor), 1000)
      })
    }

    // Manejar Tab
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

    container.appendChild(textarea)

    // Números de línea
    if (mostrarLineaNumeros) {
      const numerosDiv = document.createElement("div")
      numerosDiv.className = `
        absolute left-0 top-0 p-4 pr-2 text-right select-none pointer-events-none font-mono
        ${tema === "oscuro" ? "text-gray-500" : "text-gray-400"}
      `
      numerosDiv.style.fontSize = `${config.tamanioFuente}px`
      numerosDiv.style.lineHeight = "1.5"
      numerosDiv.style.width = "40px"

      const actualizarNumeros = () => {
        const lineas = textarea.value.split("\n").length
        numerosDiv.innerHTML = ""
        for (let i = 1; i <= lineas; i++) {
          const lineaDiv = document.createElement("div")
          lineaDiv.textContent = i.toString()
          numerosDiv.appendChild(lineaDiv)
        }
      }

      actualizarNumeros()
      textarea.addEventListener("input", actualizarNumeros)
      container.appendChild(numerosDiv)
    }

    editorRef.current.innerHTML = ""
    editorRef.current.appendChild(container)
    textareaRef.current = textarea
  }

  // Actualizar configuraciones
  useEffect(() => {
    if (tipoEditor === "monaco" && monacoRef.current) {
      try {
        monacoRef.current.updateOptions({
          fontSize: config.tamanioFuente,
          lineNumbers: mostrarLineaNumeros ? "on" : "off",
          theme: tema === "oscuro" ? "dark-theme" : "vs",
          minimap: { enabled: minimap },
          quickSuggestions: autocompletado,
        })
      } catch (error) {
        console.warn("Error actualizando opciones Monaco:", error)
      }
    } else if (tipoEditor === "basico") {
      crearEditorBasico()
    }
  }, [config.tamanioFuente, mostrarLineaNumeros, tema, minimap, autocompletado, tipoEditor])

  // Actualizar lenguaje
  useEffect(() => {
    if (tipoEditor === "monaco" && monacoRef.current && window.monaco) {
      try {
        const model = monacoRef.current.getModel()
        if (model) {
          window.monaco.editor.setModelLanguage(model, mapearLenguaje(lenguajeDetectado))
        }
      } catch (error) {
        console.warn("Error cambiando lenguaje:", error)
      }
    }
  }, [lenguajeDetectado, tipoEditor])

  // Actualizar código
  useEffect(() => {
    if (tipoEditor === "monaco" && monacoRef.current) {
      try {
        const currentValue = monacoRef.current.getValue()
        if (currentValue !== codigo) {
          monacoRef.current.setValue(codigo)
        }
      } catch (error) {
        console.warn("Error actualizando código Monaco:", error)
      }
    } else if (tipoEditor === "basico" && textareaRef.current) {
      if (textareaRef.current.value !== codigo) {
        textareaRef.current.value = codigo
      }
    }
  }, [codigo, tipoEditor])

  const mapearLenguaje = (lenguaje: string): string => {
    const mapeo: { [key: string]: string } = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      html: "html",
      css: "css",
      java: "java",
      cpp: "cpp",
      php: "php",
      sql: "sql",
      json: "json",
      markdown: "markdown",
      bash: "shell",
      react: "typescript",
    }
    return mapeo[lenguaje] || "plaintext"
  }

  const detectarYActualizarLenguaje = useCallback(
    (codigoActual: string) => {
      if (autoDetectar && codigoActual.trim().length > 10) {
        try {
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
        } catch (err) {
          console.warn("Error detectando lenguaje:", err)
        }
      }
    },
    [autoDetectar, lenguajeDetectado, onChange, toast],
  )

  const obtenerCodigoActual = (): string => {
    if (tipoEditor === "monaco" && monacoRef.current) {
      try {
        return monacoRef.current.getValue()
      } catch (error) {
        console.warn("Error obteniendo código de Monaco:", error)
      }
    }
    if (textareaRef.current) {
      return textareaRef.current.value
    }
    return codigo
  }

  const copiarAlPortapapeles = async () => {
    try {
      const codigoActual = obtenerCodigoActual()
      await navigator.clipboard.writeText(codigoActual)
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

  const formatearCodigoActual = async () => {
    if (soloLectura) return

    try {
      const codigoActual = obtenerCodigoActual()
      const codigoFormateado = formatearCodigo(codigoActual, lenguajeDetectado)

      if (tipoEditor === "monaco" && monacoRef.current) {
        monacoRef.current.setValue(codigoFormateado)
      } else if (textareaRef.current) {
        textareaRef.current.value = codigoFormateado
      }

      if (onChange) {
        onChange(codigoFormateado)
      }

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

  const ejecutarCodigo = () => {
    if (lenguajeDetectado === "javascript") {
      try {
        const codigoActual = obtenerCodigoActual()
        const resultado = eval(codigoActual)
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
    const codigoActual = obtenerCodigoActual()
    const blob = new Blob([codigoActual], { type: "text/plain" })
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
    const codigoActual = obtenerCodigoActual()
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Snippet de código",
          text: codigoActual,
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

  const alternarMinimap = () => {
    setMinimap(!minimap)
  }

  const alternarAutocompletado = () => {
    setAutocompletado(!autocompletado)
  }

  const obtenerEstadoEditor = () => {
    switch (tipoEditor) {
      case "cargando":
        return { texto: "Cargando...", color: "text-blue-600" }
      case "monaco":
        return { texto: "Monaco ✓", color: "text-green-600" }
      case "basico":
        return { texto: "Básico ✓", color: "text-orange-600" }
      default:
        return { texto: "Editor", color: "text-gray-600" }
    }
  }

  const estadoEditor = obtenerEstadoEditor()

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
          <Badge variant="outline" className={`text-xs ${estadoEditor.color}`}>
            {estadoEditor.texto}
          </Badge>
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
                title="Formatear código"
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
            onClick={alternarAutocompletado}
            className={`h-8 bg-transparent ${autocompletado ? "text-green-600" : ""}`}
            title="Alternar autocompletado"
          >
            <Zap className="h-3 w-3" />
          </Button>

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

          {tipoEditor === "monaco" && (
            <Button
              variant="outline"
              size="sm"
              onClick={alternarMinimap}
              className={`h-8 bg-transparent ${minimap ? "text-blue-600" : ""}`}
              title="Alternar minimap"
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}

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
        className="border rounded-md overflow-hidden relative"
        style={{ height: pantallaCompleta ? "calc(100vh - 100px)" : altura }}
      >
        {tipoEditor === "cargando" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Code className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">Cargando editor...</p>
            </div>
          </div>
        )}
      </div>

      {!soloLectura && tipoEditor !== "cargando" && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>💡 Tab para indentar, formateo automático disponible</span>
          {tipoEditor === "monaco" && <span>🎨 Coloración de sintaxis: Monaco Editor</span>}
          {tipoEditor === "basico" && <span>📝 Editor básico con funcionalidad completa</span>}
          <span>⚡ Autocompletado: {autocompletado ? "Activado" : "Desactivado"}</span>
        </div>
      )}
    </div>
  )
}
