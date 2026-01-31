import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCreatePost } from '../../hooks/usePosts'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import ReactMarkdown from 'react-markdown'

const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']).default('published'),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

export const CreatePost = () => {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      status: 'published',
    },
  })

  const content = watch('content')

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      const tags = data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      const post = await createPost.mutateAsync({
        title: data.title,
        content: data.content,
        tags,
        status: data.status,
      })

      toast.success('Post created successfully!')
      navigate(`/posts/${post._id}`)
    } catch (error: any) {
      console.error('Failed to create post:', error)
      
      // Handle validation errors from backend
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.message || 'Validation error')
        })
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create post. Please try again.')
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter post title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" {...register('tags')} placeholder="javascript, react, tutorial" />
            {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
          </div>

          {/* Content with Preview Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {content?.length || 0} / 10 min
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>

            {!showPreview ? (
              <textarea
                id="content"
                {...register('content')}
                placeholder="Write your post content in markdown... (minimum 10 characters)"
                className={`w-full min-h-[300px] p-3 border rounded-md ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            ) : (
              <div className="w-full min-h-[300px] p-3 border border-gray-300 rounded-md bg-gray-50 prose prose-sm max-w-none">
                <ReactMarkdown>{content || '*No content to preview*'}</ReactMarkdown>
              </div>
            )}

            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || createPost.isPending}>
              {isSubmitting || createPost.isPending ? 'Creating...' : 'Create Post'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
