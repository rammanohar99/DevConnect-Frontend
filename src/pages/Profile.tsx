import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUserProfile } from '@/hooks/useUser'
import ProfileView from '@/components/profile/ProfileView'
import ProfileEdit from '@/components/profile/ProfileEdit'
import AvatarUpload from '@/components/profile/AvatarUpload'

export default function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  // If no userId param, show current user's profile
  const isOwnProfile = !userId || userId === currentUser?.id

  // Only fetch if viewing another user's profile
  const shouldFetch = !!userId && userId !== currentUser?.id
  const { data: fetchedUser, isLoading, error } = useUserProfile(shouldFetch ? userId : '')

  // Use current user data if viewing own profile, otherwise use fetched data
  const user = (isOwnProfile ? currentUser : fetchedUser) as typeof fetchedUser

  // Show loading only when fetching another user's profile
  if (shouldFetch && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error only when fetching another user's profile fails
  if (shouldFetch && (error || !user)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Profile Not Found</h2>
          <p>The user profile you're looking for doesn't exist or couldn't be loaded.</p>
        </div>
      </div>
    )
  }

  // If viewing own profile but not logged in
  if (isOwnProfile && !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Not Authenticated</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {isOwnProfile && isEditing ? (
          <>
            {/* Avatar Upload */}
            <AvatarUpload
              currentAvatar={user.profile.avatar}
              userName={user.profile.name}
              onSuccess={() => {
                // Avatar uploaded successfully
              }}
            />

            {/* Profile Edit Form */}
            <ProfileEdit
              user={user}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          </>
        ) : (
          <ProfileView user={user} isOwnProfile={isOwnProfile} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  )
}
