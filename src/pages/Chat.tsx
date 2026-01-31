import { useState } from 'react'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { NewChatDialog } from '@/components/chat/NewChatDialog'
import { useChat, useSendMessage, useTypingIndicator, useOnlineStatus } from '@/hooks/useChat'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import chatService from '@/services/chat.service'

/**
 * Chat page - Main chat interface with list and conversation view
 */
export default function Chat() {
  const user = useAuthStore((state) => state.user)
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // Initialize socket connection and online status
  const { isConnected } = useOnlineStatus()

  // Fetch chats and messages
  const { chats, messages, isLoadingChats, isLoadingMessages, onlineUsers, typingUsers } =
    useChat(selectedChatId)

  // Fetch available users for new chat
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data.users || []
    },
    enabled: isNewChatDialogOpen,
  })

  // Create direct chat mutation
  const createDirectChatMutation = useMutation({
    mutationFn: (userId: string) => chatService.createDirectChat(userId),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setSelectedChatId(newChat._id)
    },
  })

  // Create group chat mutation
  const createGroupChatMutation = useMutation({
    mutationFn: (data: { name: string; participants: string[] }) =>
      chatService.createGroupChat(data),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setSelectedChatId(newChat._id)
    },
  })

  // Send message functionality
  const { sendMessage } = useSendMessage(selectedChatId || '')

  // Typing indicator functionality
  const { startTyping, stopTyping } = useTypingIndicator(selectedChatId || '')

  // Get selected chat details
  const selectedChat = chats.find((chat) => chat._id === selectedChatId)

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="border-b p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {isConnected ? (
              <span className="flex items-center gap-2 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600"></span>
                Online
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                Offline
              </span>
            )}
          </div>
          <Button
            onClick={() => setIsNewChatDialogOpen(true)}
            className="w-full"
            disabled={!isConnected}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ChatList
          chats={chats}
          currentUserId={user._id || user.id}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          onlineUsers={onlineUsers}
          isLoading={isLoadingChats}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            currentUserId={user._id || user.id}
            onSendMessage={sendMessage}
            onTyping={startTyping}
            onStopTyping={stopTyping}
            typingUsers={typingUsers}
            onlineUsers={onlineUsers}
            isLoading={isLoadingMessages}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white">
            <Card className="p-8 text-center">
              <div className="mb-4 text-6xl">💬</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Select a conversation</h2>
              <p className="text-gray-500">Choose a chat from the list to start messaging</p>
            </Card>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        isOpen={isNewChatDialogOpen}
        onClose={() => setIsNewChatDialogOpen(false)}
        onCreateDirectChat={(userId) => createDirectChatMutation.mutate(userId)}
        onCreateGroupChat={(name, participants) =>
          createGroupChatMutation.mutate({ name, participants })
        }
        availableUsers={availableUsers.filter((u: any) => u._id !== (user._id || user.id))}
      />
    </div>
  )
}
