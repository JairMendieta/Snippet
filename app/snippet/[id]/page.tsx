import { SnippetDetailClient } from "@/components/snippet-detail-client"

interface PaginaSnippetProps {
  params: {
    id: string
  }
}

export default function PaginaSnippet({ params }: PaginaSnippetProps) {
  return <SnippetDetailClient id={params.id} />
}
