import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Code2, MessageSquare, Users, Zap, Shield, Rocket, TrendingUp, Heart, Activity } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePosts } from '@/hooks/usePosts'
import { useChat } from '@/hooks/useChat'
import { useNotifications } from '@/hooks/useNotifications'
import { PostCard } from '@/components/posts'
import { formatDistanceToNow } from 'date-fns'

// Logged-in user dashboard
function AuthenticatedDashboard() {
  const user = useAuthStore((state) => state.user)
  const { data: postsData } = usePosts({}, { page: 1, limit: 5 })
  const { chats } = useChat()
  const { unreadCount } = useNotifications()

  const recentPosts = postsData?.posts || []
  const userPosts = recentPosts.filter(post => post.author._id === (user?._id || user?.id))
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            {user?.profile.avatar ? (
              <img 
                src={user.profile.avatar} 
                alt={user.profile.name}
                className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold">
                {user?.profile.name?.[0] || user?.username?.[0] || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {user?.profile.name || user?.username}!
              </h1>
              <p className="text-blue-100 mt-1">
                {user?.profile.bio || 'Ready to connect and collaborate?'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-5 h-5" />
                <span className="text-sm opacity-90">Posts</span>
              </div>
              <div className="text-2xl font-bold">{userPosts.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5" />
                <span className="text-sm opacity-90">Likes</span>
              </div>
              <div className="text-2xl font-bold">{totalLikes}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm opacity-90">Chats</span>
              </div>
              <div className="text-2xl font-bold">{chats.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                <span className="text-sm opacity-90">Notifications</span>
              </div>
              <div className="text-2xl font-bold">{unreadCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/posts/new">
                  <Button className="w-full" variant="outline">
                    <Code2 className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
                <Link to="/issues/new">
                  <Button className="w-full" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Activity Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <Link to="/posts">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.slice(0, 3).map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with the community!
                  </p>
                  <Link to="/posts/new">
                    <Button>Create Your First Post</Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{user?.role || 'User'}</span>
                </div>
                {user?.profile.skills && user.profile.skills.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Skills</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.profile.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Link to="/profile">
                  <Button variant="outline" className="w-full mt-4">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Chats */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Chats</h3>
                <Link to="/chat">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {chats.length > 0 ? (
                <div className="space-y-3">
                  {chats.slice(0, 4).map((chat) => {
                    const isGroup = chat.type === 'group'
                    const chatName = chat.name || chat.participants?.[0]?.profile?.name || 'Chat'
                    const firstLetter = chatName.charAt(0).toUpperCase()
                    
                    return (
                      <Link 
                        key={chat._id} 
                        to={`/chat?id=${chat._id}`}
                        className="flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {isGroup ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            firstLetter
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{chatName}</div>
                          {chat.lastMessage && (
                            <div className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage.content}
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No chats yet</p>
                </div>
              )}
            </Card>

            {/* Trending Topics */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'].map((topic, idx) => (
                  <Link 
                    key={idx}
                    to={`/posts?tag=${topic.toLowerCase()}`}
                    className="block p-2 rounded hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{topic}</span>
                      <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 100) + 20} posts</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Public landing page
function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-blue-400">DevConnect Pro</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Where developers collaborate, share knowledge, and build amazing things together
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Why DevConnect Pro?</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Everything you need to connect with developers worldwide
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-blue-500/50">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Code & Projects</h3>
              <p className="text-muted-foreground">
                Post your projects, get feedback, and collaborate with developers from around the world.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-purple-500/50">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-muted-foreground">
                Connect instantly with other developers through our real-time messaging system.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-green-500/50">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
              <p className="text-muted-foreground">
                Follow developers, join discussions, and grow your professional network.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-orange-500/50">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Issue Tracking</h3>
              <p className="text-muted-foreground">
                Report bugs, request features, and track project issues efficiently.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-red-500/50">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-grade security and privacy controls.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow border-2 hover:border-cyan-500/50">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-muted-foreground">
                Built with modern tech stack for lightning-fast performance and reliability.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section with Background */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Join Our Growing Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Connect with thousands of developers, share your expertise, and learn from the best in the industry.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-gray-200">Active Developers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-200">Projects Shared</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-gray-200">Messages Sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join DevConnect Pro today and become part of a thriving developer community.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-6">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function Dashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return isAuthenticated ? <AuthenticatedDashboard /> : <LandingPage />
}
