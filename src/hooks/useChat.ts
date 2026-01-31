import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useCallback } from 'react'
import chatService, { Chat, Message } from '../services/chat.service'
import socketService from '../services/socket.service'
import { useAuthStore } from '../stores/authStore'
import { showMessageNotification } from '../utils/notifications'

/**
 * Hook for managing chat functionality with socket integration
 */
export const useChat = (chatId?: string) => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // Fetch user's chats
  const {
    data: chats = [],
    isLoading: isLoadingChats,
    error: chatsError,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getUserChats(),
    enabled: !!user,
  })

  // Fetch messages for a specific chat
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.getMessages(chatId!),
    enabled: !!chatId,
  })

  // Create group chat mutation
  const createGroupChatMutation = useMutation({
    mutationFn: chatService.createGroupChat,
    onSuccess: (newChat) => {
      queryClient.setQueryData<Chat[]>(['chats'], (old = []) => [newChat, ...old])
    },
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (chatId: string) => chatService.markAsRead(chatId),
  })

  // Set up socket listeners
  useEffect(() => {
    if (!user) return

    const socket = socketService.getSocket()
    if (!socket) return

    // Join user's personal room for notifications
    socketService.joinRoom(`user:${user._id || user.id}`)

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      // Check if this message is from another user (not from current user)
      const isFromOtherUser = message.sender._id !== (user._id || user.id)

      // Show notification for messages from other users
      if (isFromOtherUser) {
        const senderName = message.sender.profile?.name || message.sender.username
        showMessageNotification(senderName, message.content, message.chat)
      }

      // Update messages if viewing this chat
      if (message.chat === chatId) {
        queryClient.setQueryData<Message[]>(['messages', chatId], (old = []) => {
          // Check if message already exists (avoid duplicates)
          const exists = old.some((m) => m._id === message._id)
          if (exists) {
            return old
          }
          return [...old, message]
        })
      }

      // Update chat list with new last message
      queryClient.setQueryData<Chat[]>(['chats'], (old = []) => {
        return old.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              lastMessage: {
                _id: message._id,
                content: message.content,
                createdAt: message.createdAt,
                sender: {
                  _id: message.sender._id,
                  username: message.sender.username,
                },
              },
              updatedAt: message.createdAt,
            }
          }
          return chat
        })
      })
    }

    // Listen for online status updates
    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId))
    }

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    }

    // Listen for typing indicators
    const handleTyping = (data: { userId: string; chatId: string }) => {
      if (data.chatId === chatId && data.userId !== (user._id || user.id)) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId]
          }
          return prev
        })
      }
    }

    const handleStopTyping = (data: { userId: string; chatId: string }) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
      }
    }

    // Register event listeners
    socketService.on('new_message', handleNewMessage)
    socketService.on('user_online', handleUserOnline)
    socketService.on('user_offline', handleUserOffline)
    socketService.on('user_typing', handleTyping)
    socketService.on('user_stop_typing', handleStopTyping)

    // Clean up
    return () => {
      socketService.off('new_message', handleNewMessage)
      socketService.off('user_online', handleUserOnline)
      socketService.off('user_offline', handleUserOffline)
      socketService.off('user_typing', handleTyping)
      socketService.off('user_stop_typing', handleStopTyping)
    }
  }, [user, chatId, queryClient])

  // Join chat room when chatId changes
  useEffect(() => {
    if (chatId) {
      socketService.joinRoom(`chat:${chatId}`)

      return () => {
        socketService.leaveRoom(`chat:${chatId}`)
      }
    }
  }, [chatId])

  return {
    chats,
    messages,
    isLoadingChats,
    isLoadingMessages,
    chatsError,
    messagesError,
    onlineUsers,
    typingUsers,
    createGroupChat: createGroupChatMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
  }
}

/**
 * Hook for sending messages
 */
export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const sendMessage = useCallback(
    (content: string) => {
      if (!user || !chatId) return

      // Emit message via socket (don't add optimistically, let the socket event handle it)
      socketService.emit('send_message', {
        chatId,
        content,
      })
    },
    [chatId, user, queryClient]
  )

  return { sendMessage }
}

/**
 * Hook for typing indicators
 */
export const useTypingIndicator = (chatId: string) => {
  const user = useAuthStore((state) => state.user)

  const startTyping = useCallback(() => {
    if (!user || !chatId) return
    socketService.emit('typing', { chatId })
  }, [chatId, user])

  const stopTyping = useCallback(() => {
    if (!user || !chatId) return
    socketService.emit('stop_typing', { chatId })
  }, [chatId, user])

  return { startTyping, stopTyping }
}

/**
 * Hook for online status
 */
export const useOnlineStatus = () => {
  const user = useAuthStore((state) => state.user)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) return

    // Connect socket
    try {
      socketService.connect()
      setIsConnected(true)

      // Emit user online status
      socketService.emit('user_online')

      // Listen for connection status
      const socket = socketService.getSocket()
      if (socket) {
        socket.on('connect', () => {
          setIsConnected(true)
          socketService.emit('user_online')
        })

        socket.on('disconnect', () => {
          setIsConnected(false)
        })
      }

      // Emit offline status on unmount
      return () => {
        socketService.emit('user_offline')
        socketService.disconnect()
      }
    } catch (error) {
      console.error('Failed to connect socket:', error)
      setIsConnected(false)
    }
  }, [user])

  return { isConnected }
}

export default useChat
