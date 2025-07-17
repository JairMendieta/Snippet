"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Editor from "@monaco-editor/react"
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
  Trash2,
  RotateCcw,
  FileText,
} from "lucide-react"
import { obtenerConfiguracion } from "@/lib/storage"
import { detectarLenguaje, formatearCodigo } from "@/lib/language-detector"
import { LENGUAJES_SOPORTADOS } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAlert } from "@/hooks/use-alert"

interface EditorMonacoReactProps {
  codigo: string
  lenguaje: string
  onChange?: (codigo: string, lenguajeDetectado?: string) => void
  soloLectura?: boolean
  altura?: string
  mostrarNumeros?: boolean
  autoDetectar?: boolean
}

export function EditorMonacoReact({
  codigo,
  lenguaje,
  onChange,
  soloLectura = false,
  altura = "400px",
  mostrarNumeros,
  autoDetectar = true,
}: EditorMonacoReactProps) {
  const editorRef = useRef<any>(null)
  const [copiado, setCopiado] = useState(false)
  const [mostrarLineaNumeros, setMostrarLineaNumeros] = useState(mostrarNumeros ?? true)
  const [config, setConfig] = useState(obtenerConfiguracion())
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [tema, setTema] = useState<"vs-dark" | "light">("vs-dark")
  const [lenguajeDetectado, setLenguajeDetectado] = useState(lenguaje)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autocompletado, setAutocompletado] = useState(true)
  const [minimap, setMinimap] = useState(false)
  const [wordWrap, setWordWrap] = useState(true)
  const [historialCodigo, setHistorialCodigo] = useState<string[]>([])
  const [indiceHistorial, setIndiceHistorial] = useState(-1)
  const { toast } = useToast()
  const { showAlert } = useAlert()

  useEffect(() => {
    setConfig(obtenerConfiguracion())
  }, [])

  // Guardar en historial cuando cambia el código
  useEffect(() => {
    if (codigo && codigo.trim() !== "") {
      setHistorialCodigo((prev) => {
        const nuevo = [...prev, codigo].slice(-10) // Mantener solo los últimos 10
        return nuevo
      })
      setIndiceHistorial(-1)
    }
  }, [codigo])

  // Mapear lenguajes para Monaco
  const mapearLenguajeMonaco = (lenguaje: string): string => {
    const mapeo: { [key: string]: string } = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      html: "html",
      css: "css",
      java: "java",
      cpp: "cpp",
      csharp: "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      sql: "sql",
      json: "json",
      yaml: "yaml",
      markdown: "markdown",
      bash: "shell",
      powershell: "powershell",
      swift: "swift",
      kotlin: "kotlin",
      dart: "dart",
      vue: "html",
      react: "typescript",
      angular: "typescript",
    }
    return mapeo[lenguaje] || "plaintext"
  }

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

  // Manejar cuando el editor está listo
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    setCargando(false)

    // Configurar temas personalizados
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "regexp", foreground: "D16969" },
        { token: "operator", foreground: "D4D4D4" },
        { token: "namespace", foreground: "4EC9B0" },
        { token: "type", foreground: "4EC9B0" },
        { token: "class", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2A2D2E",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#707070",
      },
    })

    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "keyword", foreground: "0000FF", fontStyle: "bold" },
        { token: "string", foreground: "A31515" },
        { token: "number", foreground: "098658" },
        { token: "regexp", foreground: "811F3F" },
        { token: "operator", foreground: "000000" },
        { token: "namespace", foreground: "267F99" },
        { token: "type", foreground: "267F99" },
        { token: "class", foreground: "267F99" },
        { token: "function", foreground: "795E26" },
        { token: "variable", foreground: "001080" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#000000",
        "editorLineNumber.foreground": "#237893",
        "editor.selectionBackground": "#ADD6FF",
        "editorCursor.foreground": "#000000",
        "editor.lineHighlightBackground": "#F0F0F0",
        "editorIndentGuide.background": "#D3D3D3",
        "editorIndentGuide.activeBackground": "#939393",
      },
    })

    // Aplicar tema personalizado
    monaco.editor.setTheme(tema === "vs-dark" ? "custom-dark" : "custom-light")

    // Configurar atajos de teclado personalizados
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      formatearCodigoActual()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      const action = editor.getAction("editor.action.copyLinesDownAction")
      if (action) action.run()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      const action = editor.getAction("editor.action.commentLine")
      if (action) action.run()
    })

    // Atajo para limpiar editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
      limpiarEditor()
    })

    // Configurar autocompletado personalizado
    if (autocompletado) {
      monaco.languages.registerCompletionItemProvider(mapearLenguajeMonaco(lenguajeDetectado), {
        provideCompletionItems: (model: any, position: any) => {
          const suggestions = obtenerSugerenciasPersonalizadas(lenguajeDetectado, monaco)
          return { suggestions }
        },
      })
    }

    toast({
      title: "Monaco Editor cargado",
      description: "Editor avanzado con todas las funciones activado",
      variant: "success",
    })
  }

  // Obtener sugerencias personalizadas por lenguaje
  const obtenerSugerenciasPersonalizadas = (lenguaje: string, monaco: any) => {
    const sugerenciasComunes = {
      javascript: [
        {
          label: "console.log",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "console.log(${1:message});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Imprime un mensaje en la consola",
        },
        {
          label: "function",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "function ${1:name}(${2:params}) {\n\t${3:// código}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Crear una función",
        },
        {
          label: "arrow function",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "const ${1:name} = (${2:params}) => {\n\t${3:// código}\n};",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Crear una función flecha",
        },
      ],
      python: [
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1:message})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Imprime un mensaje",
        },
        {
          label: "def",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "def ${1:name}(${2:params}):\n\t${3:pass}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Definir una función",
        },
      ],
      html: [
        {
          label: "div",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<div${1: class="${2:className}"}>\n\t${3:contenido}\n</div>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Crear un div",
        },
      ],
    }

    return sugerenciasComunes[lenguaje as keyof typeof sugerenciasComunes] || []
  }

  // Manejar cambios en el código
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && onChange && !soloLectura) {
      onChange(value)
      // Detectar lenguaje con debounce
      setTimeout(() => {
        detectarYActualizarLenguaje(value)
      }, 1000)
    }
  }

  const obtenerCodigoActual = (): string => {
    return editorRef.current?.getValue() || codigo
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
    if (!editorRef.current || soloLectura) return

    try {
      await editorRef.current.getAction("editor.action.formatDocument")?.run()
      toast({
        title: "Código formateado",
        description: "Se aplicó formato automático con Monaco",
        variant: "success",
      })
    } catch (error) {
      // Fallback a formateo manual
      try {
        const codigoActual = obtenerCodigoActual()
        const codigoFormateado = formatearCodigo(codigoActual, lenguajeDetectado)
        editorRef.current?.setValue(codigoFormateado)
        toast({
          title: "Código formateado",
          description: "Se aplicó formato básico al código",
          variant: "success",
        })
      } catch (err) {
        toast({
          title: "Error al formatear",
          description: "No se pudo formatear el código",
          variant: "destructive",
        })
      }
    }
  }

  const limpiarEditor = () => {
    if (soloLectura) return

    showAlert({
      title: "Limpiar Editor",
      description:
        "¿Estás seguro de que quieres eliminar todo el contenido del editor? Esta acción no se puede deshacer.",
      confirmText: "Sí, limpiar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: () => {
        const codigoVacio = ""

        if (editorRef.current) {
          editorRef.current.setValue(codigoVacio)
        }

        if (onChange) {
          onChange(codigoVacio)
        }

        toast({
          title: "Editor limpiado",
          description: "Todo el contenido se eliminó correctamente",
          variant: "success",
        })
      },
      onCancel: () => {},
    })
  }

  const deshacerCambio = () => {
    if (historialCodigo.length === 0) return

    const nuevoIndice = indiceHistorial === -1 ? historialCodigo.length - 2 : Math.max(0, indiceHistorial - 1)
    const codigoAnterior = historialCodigo[nuevoIndice]

    if (codigoAnterior && editorRef.current) {
      editorRef.current.setValue(codigoAnterior)
      setIndiceHistorial(nuevoIndice)

      if (onChange) {
        onChange(codigoAnterior)
      }

      toast({
        title: "Cambio deshecho",
        description: "Se restauró una versión anterior del código",
        variant: "success",
      })
    }
  }

  const insertarPlantilla = () => {
    const plantillas = {
      javascript: `// Plantilla JavaScript
function ejemplo() {
  console.log("¡Hola mundo!");
  return "Plantilla insertada";
}

ejemplo();`,
      python: `# Plantilla Python
def ejemplo():
    print("¡Hola mundo!")
    return "Plantilla insertada"

ejemplo()`,
      html: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento</title>
</head>
<body>
    <h1>¡Hola mundo!</h1>
</body>
</html>`,
      css: `/* Plantilla CSS */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`,
    }

    const plantilla =
      plantillas[lenguajeDetectado as keyof typeof plantillas] ||
      `// Plantilla para ${lenguajeDetectado}
// Escribe tu código aquí`

    if (editorRef.current) {
      editorRef.current.setValue(plantilla)

      if (onChange) {
        onChange(plantilla)
      }

      toast({
        title: "Plantilla insertada",
        description: `Se insertó una plantilla básica para ${lenguajeDetectado}`,
        variant: "success",
      })
    }
  }

  const ejecutarCodigo = () => {
    if (lenguajeDetectado === "javascript") {
      try {
        const codigoActual = obtenerCodigoActual()
        // Crear un contexto seguro para la ejecución
        const resultado = new Function(codigoActual)()
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
    const nuevoTema = tema === "vs-dark" ? "light" : "vs-dark"
    setTema(nuevoTema)

    // Aplicar tema personalizado inmediatamente
    if (editorRef.current) {
      const monaco = (window as any).monaco
      if (monaco) {
        monaco.editor.setTheme(nuevoTema === "vs-dark" ? "custom-dark" : "custom-light")
      }
    }
  }

  const alternarMinimap = () => {
    setMinimap(!minimap)
  }

  const alternarAutocompletado = () => {
    setAutocompletado(!autocompletado)
  }

  const alternarWordWrap = () => {
    setWordWrap(!wordWrap)
  }

  // Opciones del editor
  const opcionesEditor = {
    fontSize: config.tamanioFuente,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    lineNumbers: mostrarLineaNumeros ? ("on" as const) : ("off" as const),
    minimap: { enabled: minimap },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: wordWrap ? ("on" as const) : ("off" as const),
    contextmenu: true,
    selectOnLineNumbers: true,
    cursorStyle: "line" as const,
    cursorBlinking: "blink" as const,
    folding: true,
    matchBrackets: "always" as const,
    autoIndent: "full" as const,
    formatOnPaste: true,
    formatOnType: false,
    quickSuggestions: autocompletado,
    suggestOnTriggerCharacters: autocompletado,
    acceptSuggestionOnEnter: "on" as const,
    parameterHints: { enabled: autocompletado },
    hover: { enabled: true },
    links: true,
    colorDecorators: true,
    readOnly: soloLectura,
    theme: tema === "vs-dark" ? "custom-dark" : "custom-light",
    scrollbar: {
      vertical: "visible" as const,
      horizontal: "visible" as const,
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: "never" as const,
      seedSearchStringFromSelection: "always" as const,
    },
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
          <Badge variant="outline" className="text-xs text-green-600">
            {cargando ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Cargando...
              </>
            ) : (
              "Monaco ✓"
            )}
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
                onClick={insertarPlantilla}
                className="h-8 bg-transparent"
                title="Insertar plantilla"
                disabled={cargando}
              >
                <FileText className="h-3 w-3" />
              </Button>

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

              <Button
                variant="outline"
                size="sm"
                onClick={deshacerCambio}
                className="h-8 bg-transparent"
                title="Deshacer cambio"
                disabled={cargando || historialCodigo.length === 0}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={limpiarEditor}
                className="h-8 bg-transparent"
                title="Limpiar editor (Ctrl+Shift+K)"
                disabled={cargando || soloLectura}
              >
                <Trash2 className="h-3 w-3" />
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
        className="border rounded-md overflow-hidden"
        style={{ height: pantallaCompleta ? "calc(100vh - 100px)" : altura }}
      >
        <Editor
          height="100%"
          language={mapearLenguajeMonaco(lenguajeDetectado)}
          value={codigo}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={opcionesEditor}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600">Cargando Monaco Editor...</p>
              </div>
            </div>
          }
        />
      </div>

      {!soloLectura && !cargando && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>💡 Atajos: Ctrl+S (formatear), Ctrl+D (duplicar), Ctrl+/ (comentar), Ctrl+Shift+K (limpiar)</span>
          <span>🎨 Monaco Editor con coloración de sintaxis completa</span>
          <span>⚡ Autocompletado: {autocompletado ? "Activado" : "Desactivado"}</span>
          <span>📏 Ajuste de línea: {wordWrap ? "Activado" : "Desactivado"}</span>
        </div>
      )}
    </div>
  )
}
