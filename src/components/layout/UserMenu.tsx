import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserMenu() {
  const { user, clearAuth } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    clearAuth()
    setIsOpen(false)
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {user.profile?.avatar ? (
            <img
              src={user.profile.avatar}
              alt={user.profile?.name || user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primary">
              {(user.profile?.name || user.username).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-sm">{user.username}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-white shadow-lg"
        >
          <div className="p-3 border-b">
            <p className="font-medium">{user.profile?.name || user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
