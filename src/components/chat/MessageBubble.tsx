import React from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  _id: string
  sender: {
    _id: string
    username: string
    profile: {
      avatar?: string
      name: string
    }
  }
  content: string
  createdAt: string
  readBy: string[]
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  showAvatar?: boolean
}

/**
 * MessageBubble component displays a single chat message
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
}) => {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender.profile.avatar ? (
            <img
              src={message.sender.profile.avatar}
              alt={message.sender.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
              {message.sender.profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name (only for other users' messages) */}
        {!isOwnMessage && (
          <span className="mb-1 text-xs font-medium text-gray-600">
            {message.sender.profile?.name || message.sender.username}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="mt-1 text-xs text-gray-500">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}

export default MessageBubble
