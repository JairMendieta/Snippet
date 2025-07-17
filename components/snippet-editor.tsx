"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface SnippetEditorProps {
  code: string
  language: string
  onChange?: (code: string) => void
  readOnly?: boolean
  height?: string
}

export function SnippetEditor({ code, language, onChange, readOnly = false, height = "400px" }: SnippetEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && editorRef.current) {
      // Simular Monaco Editor con un textarea estilizado
      // En una implementación real, aquí cargarías Monaco Editor
      const textarea = document.createElement("textarea")
      textarea.value = code
      textarea.readOnly = readOnly
      textarea.className = `
        w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 
        border-0 outline-none resize-none rounded-md
      `
      textarea.style.height = height

      if (onChange && !readOnly) {
        textarea.addEventListener("input", (e) => {
          onChange((e.target as HTMLTextAreaElement).value)
        })
      }

      editorRef.current.innerHTML = ""
      editorRef.current.appendChild(textarea)
      monacoRef.current = textarea
    }
  }, [code, language, onChange, readOnly, height])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 capitalize">{language}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-transparent"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div ref={editorRef} className="border rounded-md overflow-hidden" style={{ height }} />
    </div>
  )
}
