import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationBell } from '@/components/notifications'
import UserMenu from './UserMenu'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">DevConnect Pro</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" className="text-red-600 hover:text-red-700">
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
                <UserMenu />
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
