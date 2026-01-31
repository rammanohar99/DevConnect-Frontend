import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useInitializeAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { initializeNotifications } from '@/utils/notifications'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { ModeratorRoute } from '@/components/auth/ModeratorRoute'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Notifications from '@/pages/Notifications'
import NotFound from '@/pages/NotFound'
import { Posts, PostDetail, NewPost } from '@/pages/posts'
import { Issues, IssueDetail, NewIssue } from '@/pages/issues'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { ModeratorDashboard } from '@/pages/moderator/ModeratorDashboard'
import Chat from '@/pages/Chat'
import { Toaster } from 'sonner'

function AppContent() {
  // Initialize auth on app load
  const { isLoading } = useInitializeAuth()

  // Initialize notifications on app load
  useEffect(() => {
    initializeNotifications()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        {/* Post Routes */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route
          path="/posts/new"
          element={
            <ProtectedRoute>
              <NewPost />
            </ProtectedRoute>
          }
        />
        {/* Issue Routes */}
        <Route path="/issues" element={<Issues />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route
          path="/issues/new"
          element={
            <ProtectedRoute>
              <NewIssue />
            </ProtectedRoute>
          }
        />
        {/* Chat Routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/* Moderator Routes */}
        <Route
          path="/moderator"
          element={
            <ModeratorRoute>
              <ModeratorDashboard />
            </ModeratorRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AppContent />
    </BrowserRouter>
  )
}

export default App
