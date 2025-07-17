"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Share, MessageCircle, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeCollaborationProps {
  snippetId: string
  titulo: string
  codigo: string
}

interface Colaborador {
  id: string
  nombre: string
  avatar: string
  activo: boolean
  ultimaActividad: string
}

interface Comentario {
  id: string
  autor: string
  mensaje: string
  linea?: number
  fecha: string
}

export function CodeCollaboration({ snippetId, titulo, codigo }: CodeCollaborationProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [enlaceCompartir, setEnlaceCompartir] = useState("")
  const [mostrarQR, setMostrarQR] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Simular colaboradores activos
    setColaboradores([
      {
        id: "1",
        nombre: "Ana García",
        avatar: "AG",
        activo: true,
        ultimaActividad: "Hace 2 min",
      },
      {
        id: "2",
        nombre: "Carlos López",
        avatar: "CL",
        activo: false,
        ultimaActividad: "Hace 15 min",
      },
    ])

    // Simular comentarios
    setComentarios([
      {
        id: "1",
        autor: "Ana García",
        mensaje: "Esta función se podría optimizar usando map en lugar de forEach",
        linea: 5,
        fecha: "Hace 10 min",
      },
      {
        id: "2",
        autor: "Carlos López",
        mensaje: "Excelente implementación, muy limpia",
        fecha: "Hace 1 hora",
      },
    ])
  }, [])

  const generarEnlaceCompartir = () => {
    const enlace = `${window.location.origin}/snippet/shared/${snippetId}?token=${Math.random().toString(36).substr(2, 9)}`
    setEnlaceCompartir(enlace)

    navigator.clipboard.writeText(enlace)
    toast({
      title: "Enlace copiado",
      description: "El enlace para compartir se copió al portapapeles",
      variant: "success",
    })
  }

  const generarQR = () => {
    setMostrarQR(true)
    // En producción, usarías una librería como qrcode
    toast({
      title: "Código QR generado",
      description: "Escanea el código para acceder al snippet",
      variant: "success",
    })
  }

  const agregarComentario = () => {
    if (!nuevoComentario.trim()) return

    const comentario: Comentario = {
      id: Date.now().toString(),
      autor: "Tú",
      mensaje: nuevoComentario,
      fecha: "Ahora",
    }

    setComentarios([comentario, ...comentarios])
    setNuevoComentario("")

    toast({
      title: "Comentario agregado",
      description: "Tu comentario se agregó exitosamente",
      variant: "success",
    })
  }

  const invitarColaborador = () => {
    toast({
      title: "Invitación enviada",
      description: "Se envió la invitación por email",
      variant: "success",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Colaboración en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Colaboradores activos */}
          <div>
            <h4 className="font-medium mb-2">Colaboradores activos</h4>
            <div className="flex items-center gap-2">
              {colaboradores.map((colaborador) => (
                <div key={colaborador.id} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{colaborador.avatar}</AvatarFallback>
                    </Avatar>
                    {colaborador.activo && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">{colaborador.nombre}</div>
                    <div className="text-gray-500">{colaborador.ultimaActividad}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compartir */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generarEnlaceCompartir} className="bg-transparent">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>

            <Button variant="outline" size="sm" onClick={generarQR} className="bg-transparent">
              <QrCode className="h-4 w-4 mr-2" />
              Código QR
            </Button>

            <Button variant="outline" size="sm" onClick={invitarColaborador} className="bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              Invitar
            </Button>
          </div>

          {enlaceCompartir && (
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm font-medium mb-1">Enlace para compartir:</p>
              <code className="text-xs bg-white p-1 rounded border block">{enlaceCompartir}</code>
            </div>
          )}

          {mostrarQR && (
            <div className="bg-gray-50 p-4 rounded border text-center">
              <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-xs text-gray-600 mt-2">Código QR del snippet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Comentarios y Revisiones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agregar comentario */}
          <div className="flex gap-2">
            <Input
              placeholder="Agregar un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  agregarComentario()
                }
              }}
            />
            <Button onClick={agregarComentario} disabled={!nuevoComentario.trim()}>
              Comentar
            </Button>
          </div>

          {/* Lista de comentarios */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{comentario.autor}</span>
                  <div className="flex items-center gap-2">
                    {comentario.linea && (
                      <Badge variant="outline" className="text-xs">
                        Línea {comentario.linea}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">{comentario.fecha}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{comentario.mensaje}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
