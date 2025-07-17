"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { SUPPORTED_LANGUAGES } from "@/lib/types"
import { useState } from "react"

interface SearchFiltersProps {
  query: string
  language: string
  tags: string[]
  availableTags: string[]
  onQueryChange: (query: string) => void
  onLanguageChange: (language: string) => void
  onTagsChange: (tags: string[]) => void
}

export function SearchFilters({
  query,
  language,
  tags,
  availableTags,
  onQueryChange,
  onLanguageChange,
  onTagsChange,
}: SearchFiltersProps) {
  const [tagInput, setTagInput] = useState("")

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const clearFilters = () => {
    onQueryChange("")
    onLanguageChange("")
    onTagsChange([])
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search snippets..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang} className="capitalize">
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add tag filter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
            className="flex-1"
          />
          <Button onClick={() => addTag(tagInput)} disabled={!tagInput}>
            Add
          </Button>
        </div>

        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm text-gray-600 mr-2">Quick tags:</span>
            {availableTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm text-gray-600 mr-2">Active filters:</span>
            {tags.map((tag) => (
              <Badge key={tag} className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
