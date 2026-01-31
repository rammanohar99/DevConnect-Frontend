import React, { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { OnlineStatus } from './OnlineStatus'

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
}

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string) => void
  onTyping: () => void
  onStopTyping: () => void
  typingUsers: string[]
  onlineUsers: Set<string>
  isLoading?: boolean
}

/**
 * ChatWindow component displays the chat conversation and message input
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  onStopTyping,
  typingUsers,
  onlineUsers,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, shouldAutoScroll])

  // Check if user is near bottom of messages
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShouldAutoScroll(isNearBottom)
  }

  // Get chat title and online status
  const getChatInfo = () => {
    if (chat.type === 'group') {
      return {
        title: chat.name || 'Group Chat',
        isOnline: false,
        showOnlineStatus: false,
      }
    }

    // Direct chat - find the other participant
    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    if (!otherParticipant) {
      return {
        title: 'Chat',
        isOnline: false,
        showOnlineStatus: false,
      }
    }

    return {
      title: otherParticipant.profile.name,
      isOnline: onlineUsers.has(otherParticipant._id),
      showOnlineStatus: true,
    }
  }

  const chatInfo = getChatInfo()

  // Format typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return null

    if (typingUsers.length === 1) {
      const user = chat.participants.find((p) => p._id === typingUsers[0])
      return `${user?.profile.name || 'Someone'} is typing...`
    }

    if (typingUsers.length === 2) {
      return 'Multiple people are typing...'
    }

    return `${typingUsers.length} people are typing...`
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{chatInfo.title}</h2>
          {chatInfo.showOnlineStatus && <OnlineStatus isOnline={chatInfo.isOnline} size="sm" />}
        </div>
        {chat.type === 'group' && (
          <span className="text-sm text-gray-500">{chat.participants.length} participants</span>
        )}
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={message.sender._id === currentUserId}
                showAvatar={chat.type === 'group'}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="mb-4 text-sm italic text-gray-500">{getTypingText()}</div>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={isLoading}
      />
    </div>
  )
}

export default ChatWindow
