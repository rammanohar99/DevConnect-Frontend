import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTyping: () => void
  onStopTyping: () => void
  disabled?: boolean
  placeholder?: string
}

/**
 * MessageInput component for composing and sending chat messages
 * Includes typing indicator support
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onStopTyping()
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled) return

    // Send message
    onSendMessage(trimmedMessage)

    // Clear input and stop typing indicator
    setMessage('')
    setIsTyping(false)
    onStopTyping()

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t bg-white p-4">
      <Input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        autoComplete="off"
      />
      <Button type="submit" disabled={!message.trim() || disabled} className="px-6">
        Send
      </Button>
    </form>
  )
}

export default MessageInput
