import React from 'react'

interface OnlineStatusProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

/**
 * OnlineStatus component displays a user's online/offline status
 */
export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  size = 'md',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        aria-label={isOnline ? 'Online' : 'Offline'}
      />
      {showText && <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>}
    </div>
  )
}

export default OnlineStatus
