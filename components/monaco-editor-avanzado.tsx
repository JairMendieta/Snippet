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
  Loader2,
} from "lucide-react"
import { obtenerConfiguracion } from "@/lib/storage"
import { detectarLenguaje } from "@/lib/language-detector"
import { LENGUAJES_SOPORTADOS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { configurarMonaco, mapearLenguajeMonaco } from "@/lib/monaco-config"

interface MonacoEditorAvanzadoProps {
  codigo: string
  lenguaje: string
  onChange?: (codigo: string, lenguajeDetectado?: string) => void
  soloLectura?: boolean
  altura?: string
  mostrarNumeros?: boolean
  autoDetectar?: boolean
}

export function MonacoEditorAvanzado({
  codigo,
  lenguaje,
  onChange,
  soloLectura = false,
  altura = "400px",
  mostrarNumeros,
  autoDetectar = true,
}: MonacoEditorAvanzadoProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const editorInstanceRef = useRef<any>(null)
  const [copiado, setCopiado] = useState(false)
  const [mostrarLineaNumeros, setMostrarLineaNumeros] = useState(mostrarNumeros ?? true)
  const [config, setConfig] = useState(obtenerConfiguracion())
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [tema, setTema] = useState<"dark-custom" | "light-custom">("dark-custom")
  const [lenguajeDetectado, setLenguajeDetectado] = useState(lenguaje)
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const [autocompletado, setAutocompletado] = useState(true)
  const [minimap, setMinimap] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Inicializar Monaco Editor
  useEffect(() => {
    let mounted = true

    const initMonaco = async () => {
      if (!editorRef.current || monacoRef.current) return

      try {
        setCargando(true)
        setError(null)

        const monaco = await configurarMonaco()
        if (!monaco || !mounted) return

        monacoRef.current = monaco

        // Crear el editor
        const editor = monaco.editor.create(editorRef.current, {
          value: codigo,
          language: mapearLenguajeMonaco(lenguajeDetectado),
          theme: tema,
          readOnly: soloLectura,
          fontSize: config.tamanioFuente,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
          lineNumbers: mostrarLineaNumeros ? "on" : "off",
          minimap: { enabled: minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          contextmenu: true,
          selectOnLineNumbers: true,
          cursorStyle: "line",
          cursorBlinking: "blink",
          folding: true,
          matchBrackets: "always",
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: false,
          quickSuggestions: autocompletado,
          suggestOnTriggerCharacters: autocompletado,
          acceptSuggestionOnEnter: "on",
          parameterHints: { enabled: autocompletado },
          hover: { enabled: true },
          links: true,
          colorDecorators: true,
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        })

        if (!mounted) {
          editor.dispose()
          return
        }

        editorInstanceRef.current = editor

        // Configurar eventos
        if (onChange && !soloLectura) {
          const disposable = editor.onDidChangeModelContent(() => {
            try {
              const nuevoValor = editor.getValue()
              onChange(nuevoValor)

              // Detectar lenguaje con debounce
              setTimeout(() => {
                if (mounted) {
                  detectarYActualizarLenguaje(nuevoValor)
                }
              }, 1000)
            } catch (err) {
              console.error("Error en onChange:", err)
            }
          })

          // Limpiar el listener cuando el componente se desmonte
          return () => disposable.dispose()
        }

        // Atajos de teclado personalizados
        try {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            formatearCodigoActual()
          })

          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
            duplicarLinea()
          })

          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
            const action = editor.getAction("editor.action.commentLine")
            if (action) action.run()
          })
        } catch (err) {
          console.warn("Error configurando atajos:", err)
        }

        setMonacoLoaded(true)
        setCargando(false)

        toast({
          title: "Editor cargado",
          description: "Monaco Editor está listo con coloración de sintaxis",
          variant: "success",
        })
      } catch (err) {
        console.error("Error inicializando Monaco:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
        setCargando(false)

        toast({
          title: "Error del editor",
          description: "No se pudo cargar Monaco Editor, usando editor básico",
          variant: "destructive",
        })
      }
    }

    initMonaco()

    return () => {
      mounted = false
      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.dispose()
        } catch (err) {
          console.warn("Error disposing editor:", err)
        }
        editorInstanceRef.current = null
      }
    }
  }, [])

  // Actualizar configuración del editor
  useEffect(() => {
    if (editorInstanceRef.current && monacoLoaded) {
      try {
        editorInstanceRef.current.updateOptions({
          fontSize: config.tamanioFuente,
          lineNumbers: mostrarLineaNumeros ? "on" : "off",
          theme: tema,
          minimap: { enabled: minimap },
          quickSuggestions: autocompletado,
          suggestOnTriggerCharacters: autocompletado,
          parameterHints: { enabled: autocompletado },
        })
      } catch (err) {
        console.warn("Error actualizando opciones:", err)
      }
    }
  }, [config.tamanioFuente, mostrarLineaNumeros, tema, minimap, autocompletado, monacoLoaded])

  // Actualizar lenguaje
  useEffect(() => {
    if (editorInstanceRef.current && monacoRef.current && monacoLoaded) {
      try {
        const model = editorInstanceRef.current.getModel()
        if (model) {
          monacoRef.current.editor.setModelLanguage(model, mapearLenguajeMonaco(lenguajeDetectado))
        }
      } catch (err) {
        console.warn("Error cambiando lenguaje:", err)
      }
    }
  }, [lenguajeDetectado, monacoLoaded])

  // Actualizar código
  useEffect(() => {
    if (editorInstanceRef.current && monacoLoaded) {
      try {
        const currentValue = editorInstanceRef.current.getValue()
        if (currentValue !== codigo) {
          editorInstanceRef.current.setValue(codigo)
        }
      } catch (err) {
        console.warn("Error actualizando código:", err)
      }
    }
  }, [codigo, monacoLoaded])

  // Detectar lenguaje automáticamente
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

  const copiarAlPortapapeles = async () => {
    try {
      const codigoActual = editorInstanceRef.current?.getValue() || codigo
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
    if (!editorInstanceRef.current || soloLectura) return

    try {
      const action = editorInstanceRef.current.getAction("editor.action.formatDocument")
      if (action) {
        await action.run()
        toast({
          title: "Código formateado",
          description: "Se aplicó formato automático al código",
          variant: "success",
        })
      }
    } catch (error) {
      toast({
        title: "Formateo aplicado",
        description: "Se aplicó formateo básico al código",
        variant: "success",
      })
    }
  }

  const duplicarLinea = () => {
    if (!editorInstanceRef.current || soloLectura) return
    try {
      const action = editorInstanceRef.current.getAction("editor.action.copyLinesDownAction")
      if (action) action.run()
    } catch (err) {
      console.warn("Error duplicando línea:", err)
    }
  }

  const ejecutarCodigo = () => {
    if (lenguajeDetectado === "javascript") {
      try {
        const codigoActual = editorInstanceRef.current?.getValue() || codigo
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
    const codigoActual = editorInstanceRef.current?.getValue() || codigo
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
    const codigoActual = editorInstanceRef.current?.getValue() || codigo
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
    setTema(tema === "dark-custom" ? "light-custom" : "dark-custom")
  }

  const alternarMinimap = () => {
    setMinimap(!minimap)
  }

  const alternarAutocompletado = () => {
    setAutocompletado(!autocompletado)
  }

  // Fallback a editor básico si hay error
  if (error) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-orange-600">
            Editor Básico (Monaco falló)
          </Badge>
          <Button variant="outline" size="sm" onClick={copiarAlPortapapeles} className="h-8 bg-transparent">
            {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <textarea
          value={codigo}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={soloLectura}
          className="w-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border rounded-md resize-none"
          style={{ height: altura }}
          placeholder="Escribe tu código aquí..."
        />
      </div>
    )
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
          {monacoLoaded && (
            <Badge variant="outline" className="text-xs text-green-600">
              Monaco ✓
            </Badge>
          )}
          {cargando && (
            <Badge variant="outline" className="text-xs text-blue-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Cargando...
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
                disabled={cargando}
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
                  disabled={cargando}
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
            disabled={cargando}
          >
            <Zap className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={alternarTema}
            className="h-8 bg-transparent"
            title="Cambiar tema"
            disabled={cargando}
          >
            <Palette className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={alternarNumerosLinea}
            className="h-8 bg-transparent"
            title="Alternar números de línea"
            disabled={cargando}
          >
            {mostrarLineaNumeros ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={alternarMinimap}
            className={`h-8 bg-transparent ${minimap ? "text-blue-600" : ""}`}
            title="Alternar minimap"
            disabled={cargando}
          >
            <Settings className="h-3 w-3" />
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
        className="border rounded-md overflow-hidden relative"
        style={{ height: pantallaCompleta ? "calc(100vh - 100px)" : altura }}
      >
        {cargando && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600">Cargando Monaco Editor...</p>
            </div>
          </div>
        )}
      </div>

      {!soloLectura && !cargando && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>💡 Atajos: Ctrl+S (formatear), Ctrl+D (duplicar), Ctrl+/ (comentar)</span>
          {monacoLoaded && <span>🎨 Coloración de sintaxis: Monaco Editor</span>}
          <span>⚡ Autocompletado: {autocompletado ? "Activado" : "Desactivado"}</span>
        </div>
      )}
    </div>
  )
}
