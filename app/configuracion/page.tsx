"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { obtenerConfiguracion, guardarConfiguracion, exportarSnippets, importarSnippets } from "@/lib/storage"
import type { ConfiguracionApp } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Download, Upload, Settings, Save } from "lucide-react"
import Link from "next/link"

export default function PaginaConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionApp>({
    tema: "auto",
    idioma: "es",
    mostrarLineaNumeros: true,
    tamanioFuente: 14,
    autoguardado: true,
  })
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    setConfig(obtenerConfiguracion())
  }, [])

  const manejarCambioConfig = (campo: keyof ConfiguracionApp, valor: any) => {
    const nuevaConfig = { ...config, [campo]: valor }
    setConfig(nuevaConfig)
    guardarConfiguracion(nuevaConfig)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const manejarExportar = () => {
    const datos = exportarSnippets()
    const blob = new Blob([datos], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `snippets-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const manejarImportar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const contenido = e.target?.result as string
      if (importarSnippets(contenido)) {
        alert("¡Snippets importados exitosamente!")
        window.location.reload()
      } else {
        alert("Error al importar los snippets. Verifica el formato del archivo.")
      }
    }
    reader.readAsText(archivo)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Configuración
              </h1>
              <p className="text-gray-600">Personaliza tu experiencia con el gestor de snippets</p>
            </div>
          </div>
          {guardado && (
            <div className="flex items-center gap-2 text-green-600">
              <Save className="h-4 w-4" />
              <span className="text-sm">Configuración guardada</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia del editor y la interfaz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Tema</Label>
                <Select value={config.tema} onValueChange={(valor) => manejarCambioConfig("tema", valor)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="oscuro">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tamaño de fuente</Label>
                <div className="mt-2">
                  <Slider
                    value={[config.tamanioFuente]}
                    onValueChange={(valor) => manejarCambioConfig("tamanioFuente", valor[0])}
                    min={10}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10px</span>
                    <span className="font-medium">{config.tamanioFuente}px</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="numeros-linea" className="text-sm font-medium">
                  Mostrar números de línea
                </Label>
                <Switch
                  id="numeros-linea"
                  checked={config.mostrarLineaNumeros}
                  onCheckedChange={(valor) => manejarCambioConfig("mostrarLineaNumeros", valor)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funcionalidad</CardTitle>
              <CardDescription>Configura el comportamiento de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Idioma</Label>
                <Select value={config.idioma} onValueChange={(valor) => manejarCambioConfig("idioma", valor)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoguardado" className="text-sm font-medium">
                  Autoguardado
                </Label>
                <Switch
                  id="autoguardado"
                  checked={config.autoguardado}
                  onCheckedChange={(valor) => manejarCambioConfig("autoguardado", valor)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Respaldo y Restauración</CardTitle>
              <CardDescription>Exporta o importa tus snippets para hacer respaldos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={manejarExportar} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Snippets
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={manejarImportar}
                    className="hidden"
                    id="importar-archivo"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("importar-archivo")?.click()}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Upload className="h-4 w-4" />
                    Importar Snippets
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                El archivo exportado incluye todos tus snippets, categorías y configuración. Puedes usarlo para hacer
                respaldos o transferir tus datos a otro dispositivo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
