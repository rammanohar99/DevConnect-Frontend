import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  popularTags?: string[]
}

export const TagFilter = ({
  selectedTags,
  onTagsChange,
  popularTags = ['javascript', 'react', 'typescript', 'nodejs', 'python', 'webdev'],
}: TagFilterProps) => {
  const [customTag, setCustomTag] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleAddCustomTag = () => {
    const tag = customTag.trim().toLowerCase()
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
      setCustomTag('')
      setShowCustomInput(false)
    }
  }

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Selected Tags</h3>
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div>
            {!showCustomInput ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomInput(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Tag
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomTag()
                    }
                  }}
                  placeholder="Enter tag name"
                  className="flex-1"
                />
                <Button onClick={handleAddCustomTag} size="sm">
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomTag('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
