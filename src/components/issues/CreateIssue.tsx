import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreateIssue } from '../../hooks/useIssues'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Loader2, X } from 'lucide-react'

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

type CreateIssueFormData = z.infer<typeof createIssueSchema>

export const CreateIssue = () => {
  const navigate = useNavigate()
  const createIssue = useCreateIssue()
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      priority: 'medium',
    },
  })

  const priority = watch('priority')

  const onSubmit = async (data: CreateIssueFormData) => {
    try {
      const issue = await createIssue.mutateAsync({
        ...data,
        labels: labels.length > 0 ? labels : undefined,
      })
      toast.success('Issue created successfully!')
      navigate(`/issues/${issue._id}`)
    } catch (error: any) {
      console.error('Failed to create issue:', error)
      
      // Handle validation errors from backend
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.message || 'Validation error')
        })
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create issue. Please try again.')
      }
    }
  }

  const handleAddLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault()
      if (!labels.includes(labelInput.trim())) {
        setLabels([...labels, labelInput.trim()])
      }
      setLabelInput('')
    }
  }

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label))
  }

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Brief description of the issue"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Provide detailed information about the issue"
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" type="button" className="w-full justify-start">
                  {priority ? priorityLabels[priority] : 'Select priority'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setValue('priority', 'low')}>Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setValue('priority', 'medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setValue('priority', 'high')}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setValue('priority', 'critical')}>
                  Critical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <Input
              id="labels"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Type and press Enter to add labels"
            />
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createIssue.isPending}>
              {createIssue.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Issue'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/issues')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
