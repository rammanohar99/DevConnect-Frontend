import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import {
  Home,
  FileText,
  AlertCircle,
  MessageSquare,
  Bell,
  User,
  Settings,
  Shield,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  moderatorOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Posts',
    href: '/posts',
    icon: FileText,
  },
  {
    title: 'Issues',
    href: '/issues',
    icon: AlertCircle,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Moderator',
    href: '/moderator',
    icon: Shield,
    adminOnly: true,
    moderatorOnly: true,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Shield,
    adminOnly: true,
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarOpen } = useUIStore()
  const { user } = useAuthStore()

  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator'

  const filteredNavItems = navItems.filter((item) => {
    // Show admin-only items only to admins
    if (item.adminOnly && !item.moderatorOnly) {
      return isAdmin
    }
    // Show moderator items to moderators (but not admins, they have their own)
    if (item.moderatorOnly && !item.adminOnly) {
      return isModerator
    }
    // Show moderator items that are also admin items
    if (item.moderatorOnly && item.adminOnly) {
      return isModerator && !isAdmin
    }
    // Show all other items
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-2 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
