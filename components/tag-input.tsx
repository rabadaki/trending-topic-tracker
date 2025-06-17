"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  defaultValue?: string[]
  value?: string[]
  placeholder?: string
  onChange?: (tags: string[]) => void
}

export function TagInput({ defaultValue = [], value, placeholder = "Add tag...", onChange }: TagInputProps) {
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue)
  const [inputValue, setInputValue] = useState("")
  
  // Use controlled value if provided, otherwise use internal state
  const tags = value !== undefined ? value : internalTags

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag]
        if (value === undefined) {
          setInternalTags(newTags)
        }
        onChange?.(newTags)
      }
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    if (value === undefined) {
      setInternalTags(newTags)
    }
    onChange?.(newTags)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  )
}
