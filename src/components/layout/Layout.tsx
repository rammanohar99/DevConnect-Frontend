import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}

        <main
          className={cn(
            'flex-1 transition-all duration-300',
            isAuthenticated && sidebarOpen ? 'md:ml-64' : ''
          )}
        >
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
