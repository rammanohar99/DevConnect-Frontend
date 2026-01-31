import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateProfile } from '@/hooks/useUser'
import { UserProfile } from '@/services/user.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  skills: z.string().optional(),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditProps {
  user: UserProfile
  onCancel?: () => void
  onSuccess?: () => void
}

export default function ProfileEdit({ user, onCancel, onSuccess }: ProfileEditProps) {
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.profile.name || '',
      bio: user.profile.bio || '',
      skills: user.profile.skills?.join(', ') || '',
      github: user.profile.socialLinks?.github || '',
      linkedin: user.profile.socialLinks?.linkedin || '',
      twitter: user.profile.socialLinks?.twitter || '',
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    // Parse skills from comma-separated string
    const skills = data.skills
      ? data.skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : []

    // Build update payload
    const updateData = {
      name: data.name,
      bio: data.bio || undefined,
      skills,
      socialLinks: {
        github: data.github || undefined,
        linkedin: data.linkedin || undefined,
        twitter: data.twitter || undefined,
      },
    }

    updateProfile.mutate(updateData, {
      onSuccess: () => {
        if (onSuccess) onSuccess()
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description about yourself (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, React, Node.js" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of your skills</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Links</h3>

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {updateProfile.isError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {updateProfile.error instanceof Error
                  ? updateProfile.error.message
                  : 'Failed to update profile. Please try again.'}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
