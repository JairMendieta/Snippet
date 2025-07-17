"use client"

import type { Snippet } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Eye, CopyIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface SnippetCardProps {
  snippet: Snippet
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export function SnippetCard({ snippet, onDelete, onDuplicate }: SnippetCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{snippet.title}</CardTitle>
            {snippet.description && <CardDescription className="text-sm">{snippet.description}</CardDescription>}
          </div>
          <Badge variant="secondary" className="ml-2 capitalize">
            {snippet.language}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-hidden text-ellipsis max-h-32">
            <code>
              {snippet.code.substring(0, 200)}
              {snippet.code.length > 200 ? "..." : ""}
            </code>
          </pre>
        </div>

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 mb-3">
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-3">
          Created: {formatDate(snippet.createdAt)}
          {snippet.updatedAt !== snippet.createdAt && (
            <span className="block">Updated: {formatDate(snippet.updatedAt)}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/snippet/${snippet.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 bg-transparent">
            <CopyIcon className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDuplicate(snippet.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(snippet.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
