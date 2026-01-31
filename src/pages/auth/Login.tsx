import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const login = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data, {
      onError: (error: any) => {
        // Extract user-friendly message from error response
        const message = error?.response?.data?.message || 'Login failed. Please check your credentials.'
        
        // Don't show technical error messages like "Request failed with status code 401"
        const userFriendlyMessage = message.includes('status code') 
          ? 'Login failed. Please check your credentials.'
          : message
        
        // Check if it's a "user not found" error
        if (userFriendlyMessage.toLowerCase().includes('no account') || userFriendlyMessage.toLowerCase().includes('not found')) {
          toast.error(userFriendlyMessage, {
            description: 'Create an account to get started!',
            action: {
              label: 'Sign Up',
              onClick: () => navigate('/register'),
            },
          })
        } else if (userFriendlyMessage.toLowerCase().includes('incorrect password')) {
          toast.error(userFriendlyMessage)
        } else {
          // Generic error - don't show technical details
          toast.error('Unable to login. Please check your credentials and try again.')
        }
      },
      onSuccess: () => {
        toast.success('Welcome back!', {
          description: 'Successfully logged in to your account',
        })
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {login.isError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {(() => {
                        const error = login.error as any
                        const errorMessage = error?.response?.data?.message || 'Login failed'
                        
                        // Don't show technical error messages
                        if (errorMessage.includes('status code') || errorMessage.includes('Request failed')) {
                          return (
                            <>
                              <span className="block mb-1">Unable to login</span>
                              <span className="font-normal text-xs opacity-90">
                                Please check your email and password, then try again.
                              </span>
                            </>
                          )
                        }
                        
                        // Check if user not found
                        if (errorMessage.toLowerCase().includes('no account') || errorMessage.toLowerCase().includes('not found')) {
                          return (
                            <>
                              <span className="block mb-1">Account not found</span>
                              <span className="font-normal text-xs opacity-90">
                                This email isn't registered yet.{' '}
                                <Link to="/register" className="underline hover:opacity-80">
                                  Create an account
                                </Link>
                                {' '}to get started!
                              </span>
                            </>
                          )
                        }
                        
                        // Check if wrong password
                        if (errorMessage.toLowerCase().includes('incorrect password')) {
                          return (
                            <>
                              <span className="block mb-1">Incorrect password</span>
                              <span className="font-normal text-xs opacity-90">
                                Please check your password and try again.
                              </span>
                            </>
                          )
                        }
                        
                        // Default error - show user-friendly message
                        return (
                          <>
                            <span className="block mb-1">Login failed</span>
                            <span className="font-normal text-xs opacity-90">
                              Please check your credentials and try again.
                            </span>
                          </>
                        )
                      })()}
                    </p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
