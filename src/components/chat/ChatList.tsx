import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { OnlineStatus } from './OnlineStatus'
import { Card } from '../ui/card'

interface Chat {
  _id: string
  type: 'direct' | 'group'
  name?: string
  participants: Array<{
    _id: string
    username: string
    profile: {
      avatar?: string
      name: string
    }
  }>
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      _id: string
      username: string
    }
  }
  updatedAt: string
}

interface ChatListProps {
  chats: Chat[]
  currentUserId: string
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onlineUsers: Set<string>
  isLoading?: boolean
}

/**
 * ChatList component displays a list of user's chats
 */
export const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentUserId,
  selectedChatId,
  onSelectChat,
  onlineUsers,
  isLoading = false,
}) => {
  const getChatDisplay = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        name: chat.name || 'Group Chat',
        avatar: null,
        isOnline: false,
      }
    }

    // Direct chat - find the other participant
    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    if (!otherParticipant) {
      return {
        name: 'Unknown User',
        avatar: null,
        isOnline: false,
      }
    }

    return {
      name: otherParticipant.profile?.name || otherParticipant.username,
      avatar: otherParticipant.profile?.avatar,
      isOnline: onlineUsers.has(otherParticipant._id),
    }
  }

  const formatLastMessageTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.lastMessage) {
      return 'No messages yet'
    }

    const isOwnMessage = chat.lastMessage.sender._id === currentUserId
    const prefix = isOwnMessage ? 'You: ' : ''
    const content = chat.lastMessage.content

    // Truncate long messages
    const maxLength = 50
    const truncated = content.length > maxLength ? content.substring(0, maxLength) + '...' : content

    return prefix + truncated
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No chats yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => {
        const display = getChatDisplay(chat)
        const isSelected = chat._id === selectedChatId

        return (
          <Card
            key={chat._id}
            className={`cursor-pointer border-b border-l-4 transition-colors hover:bg-gray-50 ${
              isSelected ? 'border-l-blue-500 bg-blue-50' : 'border-l-transparent'
            }`}
            onClick={() => onSelectChat(chat._id)}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {display.avatar ? (
                  <img
                    src={display.avatar}
                    alt={display.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-gray-700">
                    {display.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {chat.type === 'direct' && display.isOnline && (
                  <div className="absolute bottom-0 right-0">
                    <OnlineStatus isOnline={true} size="sm" />
                  </div>
                )}
              </div>

              {/* Chat info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold text-gray-900">{display.name}</h3>
                  {chat.lastMessage && (
                    <span className="flex-shrink-0 text-xs text-gray-500">
                      {formatLastMessageTime(chat.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-gray-600">{getLastMessagePreview(chat)}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default ChatList
