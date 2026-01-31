import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAddLabel, useRemoveLabel } from '../../hooks/useIssues'

interface LabelManagerProps {
  issueId: string
  labels: string[]
  canEdit?: boolean
}

export const LabelManager = ({ issueId, labels, canEdit = false }: LabelManagerProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const addLabel = useAddLabel()
  const removeLabel = useRemoveLabel()

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return

    try {
      await addLabel.mutateAsync({ issueId, label: newLabel.trim() })
      setNewLabel('')
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add label:', error)
    }
  }

  const handleRemoveLabel = async (label: string) => {
    try {
      await removeLabel.mutateAsync({ issueId, label })
    } catch (error) {
      console.error('Failed to remove label:', error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Labels</h4>
        {canEdit && !isAdding && (
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="h-6 px-2">
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
          >
            {label}
            {canEdit && (
              <button
                onClick={() => handleRemoveLabel(label)}
                className="hover:bg-purple-200 rounded-full p-0.5"
                disabled={removeLabel.isPending}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {labels.length === 0 && !isAdding && (
          <span className="text-sm text-gray-500">No labels</span>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddLabel} className="flex gap-2">
          <Input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter label name"
            className="h-8 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={addLabel.isPending || !newLabel.trim()}>
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setNewLabel('')
            }}
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  )
}
