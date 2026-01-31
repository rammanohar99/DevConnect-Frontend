import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

/**
 * Socket.io service singleton for managing WebSocket connections
 * Handles authentication, auto-reconnection, and event management
 */
class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map()

  /**
   * Initialize and connect the socket with authentication
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = localStorage.getItem('accessToken')

    if (!token) {
      console.warn('[Socket] No access token found, cannot connect')
      throw new Error('Authentication required for socket connection')
    }

    // Create socket connection with auth
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.setupEventHandlers()

    return this.socket
  }

  /**
   * Set up core socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection successful
    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully', this.socket?.id)
      this.reconnectAttempts = 0
    })

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
      this.reconnectAttempts++

      // If authentication error, try to refresh token
      if (error.message.includes('Authentication') || error.message.includes('jwt')) {
        this.handleAuthenticationError()
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached')
        this.disconnect()
      }
    })

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)

      // If disconnected by server, try to reconnect
      if (reason === 'io server disconnect') {
        this.socket?.connect()
      }
    })

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] Reconnection attempt ${attemptNumber}`)
    })

    // Reconnection successful
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] Reconnected after ${attemptNumber} attempts`)
      this.reconnectAttempts = 0
    })

    // Reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed')
      this.disconnect()
    })

    // Re-attach all registered event listeners
    this.reattachEventListeners()
  }

  /**
   * Handle authentication errors by attempting to refresh the token
   */
  private async handleAuthenticationError(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Attempt to refresh the token
      const response = await fetch(`${SOCKET_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const { accessToken, refreshToken: newRefreshToken } = await response.json()

      // Store new tokens
      localStorage.setItem('accessToken', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      // Reconnect with new token
      this.disconnect()
      this.connect()
    } catch (error) {
      console.error('[Socket] Failed to refresh token:', error)
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
  }

  /**
   * Re-attach all registered event listeners after reconnection
   */
  private reattachEventListeners(): void {
    if (!this.socket) return

    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        this.socket?.on(event, listener)
      })
    })
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('[Socket] Disconnected')
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn(`[Socket] Cannot emit "${event}" - socket not initialized`)
      return
    }

    if (!this.socket.connected) {
      // Queue the event to be sent once connected
      this.socket.once('connect', () => {
        this.socket?.emit(event, data)
      })
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * Listen to an event from the server
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn(`[Socket] Cannot listen to "${event}" - socket not initialized`)
      return
    }

    // Store the listener for re-attachment after reconnection
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)?.add(callback)

    this.socket.on(event, callback)
  }

  /**
   * Remove an event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
      this.eventListeners.get(event)?.delete(callback)
    } else {
      this.socket.off(event)
      this.eventListeners.delete(event)
    }
  }

  /**
   * Listen to an event once
   */
  once(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn(`[Socket] Cannot listen to "${event}" - socket not initialized`)
      return
    }

    this.socket.once(event, callback)
  }

  /**
   * Join a room (for chat or notifications)
   */
  joinRoom(room: string): void {
    if (!this.socket) {
      console.warn(`[Socket] Cannot join room "${room}" - socket not initialized`)
      return
    }

    const joinFn = () => {
      // If it's a chat room, use join_chat event
      if (room.startsWith('chat:')) {
        const chatId = room.replace('chat:', '')
        this.emit('join_chat', { chatId })
      } else {
        // For other rooms (like user rooms), just join directly
        this.emit('join_room', { room })
      }
    }

    if (!this.socket.connected) {
      // Wait for connection before joining
      this.socket.once('connect', joinFn)
    } else {
      joinFn()
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    // If it's a chat room, use leave_chat event
    if (room.startsWith('chat:')) {
      const chatId = room.replace('chat:', '')
      this.emit('leave_chat', { chatId })
    } else {
      // For other rooms, just leave directly
      this.emit('leave_room', { room })
    }
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService
