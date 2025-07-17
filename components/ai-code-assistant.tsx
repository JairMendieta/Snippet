"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, Code, Lightbulb, Bug } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AICodeAssistantProps {
  codigo: string
  lenguaje: string
  onSugerenciaAplicada: (codigoNuevo: string) => void
}

export function AICodeAssistant({ codigo, lenguaje, onSugerenciaAplicada }: AICodeAssistantProps) {
  const [pregunta, setPregunta] = useState("")
  const [respuesta, setRespuesta] = useState("")
  const [cargando, setCargando] = useState(false)
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const { toast } = useToast()

  // Simulación de IA - en producción conectarías con OpenAI/Claude
  const analizarCodigo = async () => {
    setCargando(true)

    // Simular análisis de IA
    setTimeout(() => {
      const analisis = generarAnalisisSimulado(codigo, lenguaje)
      setRespuesta(analisis.explicacion)
      setSugerencias(analisis.sugerencias)
      setCargando(false)

      toast({
        title: "Análisis completado",
        description: "El asistente de IA ha analizado tu código",
        variant: "success",
      })
    }, 2000)
  }

  const explicarCodigo = async () => {
    setCargando(true)

    setTimeout(() => {
      const explicacion = generarExplicacionSimulada(codigo, lenguaje)
      setRespuesta(explicacion)
      setCargando(false)
    }, 1500)
  }

  const optimizarCodigo = async () => {
    setCargando(true)

    setTimeout(() => {
      const codigoOptimizado = generarOptimizacionSimulada(codigo, lenguaje)
      onSugerenciaAplicada(codigoOptimizado)
      setCargando(false)

      toast({
        title: "Código optimizado",
        description: "Se aplicaron mejoras automáticas al código",
        variant: "success",
      })
    }, 2000)
  }

  const encontrarBugs = async () => {
    setCargando(true)

    setTimeout(() => {
      const bugs = encontrarBugsSimulados(codigo, lenguaje)
      setRespuesta(bugs)
      setCargando(false)
    }, 1800)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Asistente de IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={explicarCodigo} disabled={cargando} className="bg-transparent">
            <MessageSquare className="h-4 w-4 mr-2" />
            Explicar
          </Button>

          <Button variant="outline" size="sm" onClick={analizarCodigo} disabled={cargando} className="bg-transparent">
            <Code className="h-4 w-4 mr-2" />
            Analizar
          </Button>

          <Button variant="outline" size="sm" onClick={optimizarCodigo} disabled={cargando} className="bg-transparent">
            <Lightbulb className="h-4 w-4 mr-2" />
            Optimizar
          </Button>

          <Button variant="outline" size="sm" onClick={encontrarBugs} disabled={cargando} className="bg-transparent">
            <Bug className="h-4 w-4 mr-2" />
            Bugs
          </Button>
        </div>

        <div>
          <Textarea
            placeholder="Haz una pregunta específica sobre el código..."
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            rows={2}
          />
          <Button className="mt-2 w-full" onClick={analizarCodigo} disabled={cargando || !pregunta.trim()}>
            {cargando ? "Analizando..." : "Preguntar a la IA"}
          </Button>
        </div>

        {respuesta && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-900 mb-2">Respuesta de la IA:</h4>
            <p className="text-blue-800 text-sm whitespace-pre-wrap">{respuesta}</p>
          </div>
        )}

        {sugerencias.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Sugerencias de mejora:</h4>
            {sugerencias.map((sugerencia, index) => (
              <Badge key={index} variant="outline" className="block p-2 text-left">
                {sugerencia}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Funciones de simulación de IA
function generarAnalisisSimulado(codigo: string, lenguaje: string) {
  const analisis = {
    javascript: {
      explicacion: `Este código JavaScript utiliza ${codigo.includes("const") ? "declaraciones const" : "variables"} y ${codigo.includes("=>") ? "funciones flecha" : "funciones tradicionales"}. El código parece estar bien estructurado.`,
      sugerencias: [
        "Considera usar const en lugar de let cuando sea posible",
        "Agrega comentarios para explicar la lógica compleja",
        "Valida los parámetros de entrada",
      ],
    },
    python: {
      explicacion: `Este código Python sigue las convenciones PEP 8. ${codigo.includes("def") ? "Define funciones" : "Contiene lógica"} de manera clara.`,
      sugerencias: [
        "Agrega docstrings a las funciones",
        "Considera usar type hints",
        "Maneja las excepciones apropiadamente",
      ],
    },
    default: {
      explicacion: `Código en ${lenguaje} analizado. La estructura parece correcta y sigue buenas prácticas básicas.`,
      sugerencias: [
        "Mantén la consistencia en el estilo",
        "Agrega comentarios explicativos",
        "Considera la legibilidad del código",
      ],
    },
  }

  return analisis[lenguaje as keyof typeof analisis] || analisis.default
}

function generarExplicacionSimulada(codigo: string, lenguaje: string) {
  return `Este fragmento de código en ${lenguaje}:

1. ${codigo.split("\n")[0] ? `Comienza con: "${codigo.split("\n")[0].trim()}"` : "Está vacío"}
2. Tiene ${codigo.split("\n").length} líneas de código
3. ${codigo.includes("function") || codigo.includes("def") ? "Define funciones" : "Contiene lógica directa"}
4. ${codigo.includes("if") ? "Incluye condicionales" : "No tiene estructuras condicionales visibles"}

El propósito principal parece ser ${lenguaje === "javascript" ? "manipular datos o DOM" : lenguaje === "python" ? "procesar información" : "ejecutar una tarea específica"}.`
}

function generarOptimizacionSimulada(codigo: string, lenguaje: string) {
  // Optimizaciones básicas simuladas
  let optimizado = codigo

  if (lenguaje === "javascript") {
    optimizado = optimizado
      .replace(/var /g, "const ")
      .replace(/function\s+(\w+)\s*\(/g, "const $1 = (")
      .replace(/\)\s*{/g, ") => {")
  }

  return `// Código optimizado automáticamente\n${optimizado}`
}

function encontrarBugsSimulados(codigo: string, lenguaje: string) {
  const bugs = []

  if (codigo.includes("==") && lenguaje === "javascript") {
    bugs.push("⚠️ Usa === en lugar de == para comparaciones estrictas")
  }

  if (codigo.includes("var ") && lenguaje === "javascript") {
    bugs.push("⚠️ Evita usar 'var', prefiere 'const' o 'let'")
  }

  if (!codigo.includes("try") && codigo.includes("JSON.parse")) {
    bugs.push("⚠️ JSON.parse puede lanzar errores, considera usar try-catch")
  }

  if (bugs.length === 0) {
    return "✅ No se encontraron problemas obvios en el código. ¡Buen trabajo!"
  }

  return `Problemas encontrados:\n\n${bugs.join("\n")}`
}
