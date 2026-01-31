import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/authStore'
import { userService } from '@/services/user.service'
import { Bell, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>('account')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'account' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'security' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>Security</span>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'account' && <AccountSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AccountSettingsProps {
  user: {
    username?: string
    email?: string
    isEmailVerified?: boolean
    role?: string
  } | null
}

function AccountSettings({ user }: AccountSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex gap-2">
              <Input value={user?.email || ''} disabled className="flex-1" />
              {user?.isEmailVerified ? (
                <span className="px-3 py-2 bg-green-500/10 text-green-600 rounded-md text-sm flex items-center">
                  Verified
                </span>
              ) : (
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role || ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and all associated data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSettings() {
  const { user } = useAuthStore()
  const [emailNotifications, setEmailNotifications] = useState(
    user?.notificationPreferences?.email ?? true
  )
  const [pushNotifications, setPushNotifications] = useState(
    user?.notificationPreferences?.push ?? true
  )
  const [postComments, setPostComments] = useState(
    user?.notificationPreferences?.postComments ?? true
  )
  const [issueUpdates, setIssueUpdates] = useState(
    user?.notificationPreferences?.issueUpdates ?? true
  )
  const [chatMessages, setChatMessages] = useState(
    user?.notificationPreferences?.chatMessages ?? true
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!user || !user.id) {
      toast.error('User information not available')
      return
    }

    setIsLoading(true)

    try {
      await userService.updateNotificationPreferences(user.id, {
        email: emailNotifications,
        push: pushNotifications,
        postComments,
        issueUpdates,
        chatMessages,
      })

      toast.success('Notification preferences saved successfully')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to save notification preferences'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h3 className="text-sm font-medium">Activity Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="post-comments">Post Comments</Label>
              <p className="text-sm text-muted-foreground">When someone comments on your posts</p>
            </div>
            <Switch id="post-comments" checked={postComments} onCheckedChange={setPostComments} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="issue-updates">Issue Updates</Label>
              <p className="text-sm text-muted-foreground">Updates on issues you're following</p>
            </div>
            <Switch id="issue-updates" checked={issueUpdates} onCheckedChange={setIssueUpdates} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="chat-messages">Chat Messages</Label>
              <p className="text-sm text-muted-foreground">New messages in your chats</p>
            </div>
            <Switch id="chat-messages" checked={chatMessages} onCheckedChange={setChatMessages} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}

function SecuritySettings() {
  const { user, isAuthenticated } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to change your password')
      return
    }

    if (!user || !user.id) {
      toast.error('User information not available. Please refresh the page.')
      return
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and number')
      return
    }

    setIsLoading(true)

    try {
      await userService.changePassword(user.id, {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      toast.success('Password changed successfully')

      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Failed to change password'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Enable 2FA</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">Windows • Chrome • Active now</p>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
