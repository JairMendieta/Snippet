"use client"

import { useState, useEffect } from "react"
import { obtenerConfiguracion, guardarConfiguracion } from "@/lib/storage"
import type { ConfiguracionApp } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Palette, Zap, Brain, Shield, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ConfiguracionAvanzadaApp extends ConfiguracionApp {
  // Nuevas configuraciones únicas
  aiAsistente: boolean
  autocompletado: boolean
  formateoAutomatico: boolean
  deteccionLenguaje: boolean
  colaboracionTiempoReal: boolean
  notificacionesPush: boolean
  temaPersonalizado: {
    colorPrimario: string
    colorSecundario: string
    fuenteEditor: string
  }
  atajosTeclado: { [key: string]: string }
  plantillasPersonalizadas: string[]
  integracionGitHub: boolean
  backupAutomatico: boolean
  encriptacionLocal: boolean
}

export default function PaginaConfiguracionAvanzada() {
  const [config, setConfig] = useState<ConfiguracionAvanzadaApp>({
    tema: "auto",
    idioma: "es",
    mostrarLineaNumeros: true,
    tamanioFuente: 14,
    autoguardado: true,
    aiAsistente: true,
    autocompletado: true,
    formateoAutomatico: true,
    deteccionLenguaje: true,
    colaboracionTiempoReal: false,
    notificacionesPush: true,
    temaPersonalizado: {
      colorPrimario: "#3B82F6",
      colorSecundario: "#10B981",
      fuenteEditor: "JetBrains Mono",
    },
    atajosTeclado: {
      "Ctrl+S": "Formatear código",
      "Ctrl+D": "Duplicar línea",
      "Ctrl+/": "Comentar/descomentar",
      "Ctrl+Shift+P": "Paleta de comandos",
    },
    plantillasPersonalizadas: [],
    integracionGitHub: false,
    backupAutomatico: true,
    encriptacionLocal: false,
  })

  const [guardado, setGuardado] = useState(false)
  const [nuevaPlantilla, setNuevaPlantilla] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const configBase = obtenerConfiguracion()
    setConfig((prev) => ({ ...prev, ...configBase }))
  }, [])

  const manejarCambioConfig = (campo: keyof ConfiguracionAvanzadaApp, valor: any) => {
    const nuevaConfig = { ...config, [campo]: valor }
    setConfig(nuevaConfig)
    guardarConfiguracion(nuevaConfig)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)

    toast({
      title: "Configuración actualizada",
      description: `${campo} se actualizó correctamente`,
      variant: "success",
    })
  }

  const manejarCambioTemaPersonalizado = (propiedad: string, valor: string) => {
    const nuevoTema = { ...config.temaPersonalizado, [propiedad]: valor }
    manejarCambioConfig("temaPersonalizado", nuevoTema)
  }

  const agregarPlantillaPersonalizada = () => {
    if (nuevaPlantilla.trim()) {
      const nuevasPlantillas = [...config.plantillasPersonalizadas, nuevaPlantilla.trim()]
      manejarCambioConfig("plantillasPersonalizadas", nuevasPlantillas)
      setNuevaPlantilla("")
    }
  }

  const eliminarPlantilla = (index: number) => {
    const nuevasPlantillas = config.plantillasPersonalizadas.filter((_, i) => i !== index)
    manejarCambioConfig("plantillasPersonalizadas", nuevasPlantillas)
  }

  const resetearConfiguracion = () => {
    if (confirm("¿Estás seguro de que quieres resetear toda la configuración?")) {
      const configDefault: ConfiguracionAvanzadaApp = {
        tema: "auto",
        idioma: "es",
        mostrarLineaNumeros: true,
        tamanioFuente: 14,
        autoguardado: true,
        aiAsistente: true,
        autocompletado: true,
        formateoAutomatico: true,
        deteccionLenguaje: true,
        colaboracionTiempoReal: false,
        notificacionesPush: true,
        temaPersonalizado: {
          colorPrimario: "#3B82F6",
          colorSecundario: "#10B981",
          fuenteEditor: "JetBrains Mono",
        },
        atajosTeclado: {
          "Ctrl+S": "Formatear código",
          "Ctrl+D": "Duplicar línea",
          "Ctrl+/": "Comentar/descomentar",
          "Ctrl+Shift+P": "Paleta de comandos",
        },
        plantillasPersonalizadas: [],
        integracionGitHub: false,
        backupAutomatico: true,
        encriptacionLocal: false,
      }

      setConfig(configDefault)
      guardarConfiguracion(configDefault)

      toast({
        title: "Configuración reseteada",
        description: "Toda la configuración se restauró a los valores por defecto",
        variant: "success",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/configuracion">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                Configuración Avanzada
              </h1>
              <p className="text-gray-600">Personaliza tu experiencia al máximo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {guardado && (
              <div className="flex items-center gap-2 text-green-600">
                <Save className="h-4 w-4" />
                <span className="text-sm">Guardado</span>
              </div>
            )}
            <Button variant="outline" onClick={resetearConfiguracion}>
              Resetear Todo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* IA y Automatización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                IA y Automatización
              </CardTitle>
              <CardDescription>Funciones inteligentes para mejorar tu productividad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-asistente">Asistente de IA</Label>
                <Switch
                  id="ai-asistente"
                  checked={config.aiAsistente}
                  onCheckedChange={(valor) => manejarCambioConfig("aiAsistente", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autocompletado">Autocompletado inteligente</Label>
                <Switch
                  id="autocompletado"
                  checked={config.autocompletado}
                  onCheckedChange={(valor) => manejarCambioConfig("autocompletado", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="formateo-auto">Formateo automático</Label>
                <Switch
                  id="formateo-auto"
                  checked={config.formateoAutomatico}
                  onCheckedChange={(valor) => manejarCambioConfig("formateoAutomatico", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="deteccion-lenguaje">Detección de lenguaje</Label>
                <Switch
                  id="deteccion-lenguaje"
                  checked={config.deteccionLenguaje}
                  onCheckedChange={(valor) => manejarCambioConfig("deteccionLenguaje", valor)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Colaboración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Colaboración
              </CardTitle>
              <CardDescription>Trabaja en equipo de forma eficiente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="colaboracion-tiempo-real">Tiempo real</Label>
                <Switch
                  id="colaboracion-tiempo-real"
                  checked={config.colaboracionTiempoReal}
                  onCheckedChange={(valor) => manejarCambioConfig("colaboracionTiempoReal", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notificaciones-push">Notificaciones push</Label>
                <Switch
                  id="notificaciones-push"
                  checked={config.notificacionesPush}
                  onCheckedChange={(valor) => manejarCambioConfig("notificacionesPush", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="integracion-github">Integración GitHub</Label>
                <Switch
                  id="integracion-github"
                  checked={config.integracionGitHub}
                  onCheckedChange={(valor) => manejarCambioConfig("integracionGitHub", valor)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Seguridad y Backup
              </CardTitle>
              <CardDescription>Protege y respalda tu trabajo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="backup-automatico">Backup automático</Label>
                <Switch
                  id="backup-automatico"
                  checked={config.backupAutomatico}
                  onCheckedChange={(valor) => manejarCambioConfig("backupAutomatico", valor)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="encriptacion-local">Encriptación local</Label>
                <Switch
                  id="encriptacion-local"
                  checked={config.encriptacionLocal}
                  onCheckedChange={(valor) => manejarCambioConfig("encriptacionLocal", valor)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tema Personalizado */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-500" />
                Tema Personalizado
              </CardTitle>
              <CardDescription>Personaliza los colores y fuentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color primario</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.temaPersonalizado.colorPrimario}
                      onChange={(e) => manejarCambioTemaPersonalizado("colorPrimario", e.target.value)}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={config.temaPersonalizado.colorPrimario}
                      onChange={(e) => manejarCambioTemaPersonalizado("colorPrimario", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Color secundario</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.temaPersonalizado.colorSecundario}
                      onChange={(e) => manejarCambioTemaPersonalizado("colorSecundario", e.target.value)}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={config.temaPersonalizado.colorSecundario}
                      onChange={(e) => manejarCambioTemaPersonalizado("colorSecundario", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Fuente del editor</Label>
                <Select
                  value={config.temaPersonalizado.fuenteEditor}
                  onValueChange={(valor) => manejarCambioTemaPersonalizado("fuenteEditor", valor)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                    <SelectItem value="Fira Code">Fira Code</SelectItem>
                    <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                    <SelectItem value="Consolas">Consolas</SelectItem>
                    <SelectItem value="Monaco">Monaco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Atajos de Teclado */}
          <Card>
            <CardHeader>
              <CardTitle>Atajos de Teclado</CardTitle>
              <CardDescription>Personaliza los atajos para mayor eficiencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(config.atajosTeclado).map(([atajo, accion]) => (
                  <div key={atajo} className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="font-mono">
                      {atajo}
                    </Badge>
                    <span className="text-gray-600">{accion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plantillas Personalizadas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Plantillas Personalizadas</CardTitle>
              <CardDescription>Crea tus propias plantillas de código</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la nueva plantilla..."
                  value={nuevaPlantilla}
                  onChange={(e) => setNuevaPlantilla(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      agregarPlantillaPersonalizada()
                    }
                  }}
                />
                <Button onClick={agregarPlantillaPersonalizada} disabled={!nuevaPlantilla.trim()}>
                  Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {config.plantillasPersonalizadas.map((plantilla, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {plantilla}
                    <button onClick={() => eliminarPlantilla(index)} className="ml-1 text-red-500 hover:text-red-700">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {config.plantillasPersonalizadas.length === 0 && (
                <p className="text-gray-500 text-sm">No hay plantillas personalizadas aún</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
