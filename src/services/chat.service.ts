import api from './api'

export interface Chat {
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
    _id: string
    content: string
    createdAt: string
    sender: {
      _id: string
      username: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  chat: string
  sender: {
    _id: string
    username: string
    profile: {
      avatar?: string
      name: string
    }
  }
  content: string
  readBy: string[]
  createdAt: string
}

export interface CreateGroupChatDTO {
  name: string
  participants: string[]
}

export interface GetMessagesParams {
  page?: number
  limit?: number
}

/**
 * Chat service for API calls
 */
class ChatService {
  /**
   * Get user's chats
   */
  async getUserChats(): Promise<Chat[]> {
    const response = await api.get<{ status: string; data: { chats: Chat[] } }>('/chats')
    return response.data.data.chats || []
  }

  /**
   * Create a group chat
   */
  async createGroupChat(data: CreateGroupChatDTO): Promise<Chat> {
    const response = await api.post<{ status: string; data: { chat: Chat } }>('/chats', {
      name: data.name,
      participantIds: data.participants, // Map participants to participantIds
    })
    return response.data.data.chat
  }

  /**
   * Get messages for a chat
   */
  async getMessages(chatId: string, params?: GetMessagesParams): Promise<Message[]> {
    const response = await api.get<{ status: string; data: { messages: Message[] } }>(
      `/chats/${chatId}/messages`,
      { params }
    )
    return response.data.data.messages || []
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/read`)
  }

  /**
   * Create or get a direct chat with another user
   */
  async createDirectChat(userId: string): Promise<Chat> {
    const response = await api.post<{ status: string; data: { chat: Chat } }>('/chats/direct', {
      userId,
    })
    return response.data.data.chat
  }
}

export const chatService = new ChatService()
export default chatService
