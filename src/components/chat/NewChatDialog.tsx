import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface User {
  _id: string
  username: string
  profile: {
    name: string
    avatar?: string
  }
}

interface NewChatDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateDirectChat: (userId: string) => void
  onCreateGroupChat: (name: string, participantIds: string[]) => void
  availableUsers: User[]
}

/**
 * Dialog for creating new chats (direct or group)
 */
export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  isOpen,
  onClose,
  onCreateDirectChat,
  onCreateGroupChat,
  availableUsers,
}) => {
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [groupName, setGroupName] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateDirectChat = () => {
    if (selectedUserId) {
      onCreateDirectChat(selectedUserId)
      handleClose()
    }
  }

  const handleCreateGroupChat = () => {
    if (groupName.trim() && selectedParticipants.length > 0) {
      onCreateGroupChat(groupName.trim(), selectedParticipants)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedUserId('')
    setGroupName('')
    setSelectedParticipants([])
    setSearchQuery('')
    setChatType('direct')
    onClose()
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Chat</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Type Selection */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={chatType === 'direct' ? 'default' : 'outline'}
            onClick={() => setChatType('direct')}
            className="flex-1"
          >
            Direct Chat
          </Button>
          <Button
            variant={chatType === 'group' ? 'default' : 'outline'}
            onClick={() => setChatType('group')}
            className="flex-1"
          >
            Group Chat
          </Button>
        </div>

        {/* Group Name Input (for group chats) */}
        {chatType === 'group' && (
          <div className="mb-4">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="mt-1"
            />
          </div>
        )}

        {/* User Search */}
        <div className="mb-4">
          <Label htmlFor="search">
            {chatType === 'direct' ? 'Select User' : 'Add Participants'}
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="mt-1"
          />
        </div>

        {/* User List */}
        <div className="mb-4 max-h-64 overflow-y-auto rounded border">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-gray-50"
                onClick={() => {
                  if (chatType === 'direct') {
                    setSelectedUserId(user._id)
                  } else {
                    toggleParticipant(user._id)
                  }
                }}
              >
                {user.profile.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
                    {user.profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{user.profile.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                {chatType === 'direct' && selectedUserId === user._id && (
                  <div className="h-5 w-5 rounded-full bg-blue-500" />
                )}
                {chatType === 'group' && (
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(user._id)}
                    onChange={() => toggleParticipant(user._id)}
                    className="h-5 w-5"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={chatType === 'direct' ? handleCreateDirectChat : handleCreateGroupChat}
            disabled={
              chatType === 'direct'
                ? !selectedUserId
                : !groupName.trim() || selectedParticipants.length === 0
            }
            className="flex-1"
          >
            Create Chat
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default NewChatDialog
