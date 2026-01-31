import { UserProfile } from '@/services/user.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Calendar, Github, Linkedin, Twitter } from 'lucide-react'

interface ProfileViewProps {
  user: UserProfile
  isOwnProfile?: boolean
  onEdit?: () => void
}

export default function ProfileView({ user, isOwnProfile = false, onEdit }: ProfileViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.profile.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={user.profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {user.profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.profile.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {isOwnProfile && onEdit && (
            <Button onClick={onEdit} variant="outline">
              Edit Profile
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* Bio */}
      {user.profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{user.profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {user.profile.skills && user.profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {user.profile.socialLinks &&
        (user.profile.socialLinks.github ||
          user.profile.socialLinks.linkedin ||
          user.profile.socialLinks.twitter) && (
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {user.profile.socialLinks.github && (
                  <a
                    href={user.profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>{user.profile.socialLinks.github}</span>
                  </a>
                )}
                {user.profile.socialLinks.linkedin && (
                  <a
                    href={user.profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>{user.profile.socialLinks.linkedin}</span>
                  </a>
                )}
                {user.profile.socialLinks.twitter && (
                  <a
                    href={user.profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>{user.profile.socialLinks.twitter}</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
