import { useState } from 'react'
import { useAdminUsers, useUpdateUserRole } from '../../hooks/useAdmin'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { toast } from 'sonner'
import { Shield, UserCog, User as UserIcon } from 'lucide-react'

export const UserManagement = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'user' | 'moderator' | 'admin' | undefined>()

  const { data, isLoading, error } = useAdminUsers({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter,
  })

  const updateRoleMutation = useUpdateUserRole()

  const handleRoleChange = async (
    userId: string,
    username: string,
    newRole: 'user' | 'moderator' | 'admin'
  ) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, data: { role: newRole } })
      toast.success('Role updated successfully', {
        description: `@${username} is now a ${newRole}`,
      })
    } catch (error: any) {
      toast.error('Failed to update user role', {
        description: error.response?.data?.message || 'An error occurred',
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'moderator':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />
      case 'moderator':
        return <UserCog className="h-3 w-3" />
      default:
        return <UserIcon className="h-3 w-3" />
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search by email, username, or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filter by Role: {roleFilter || 'All'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRoleFilter(undefined)}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('user')}>User</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('moderator')}>
                Moderator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter('admin')}>Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            Failed to load users. Please try again.
          </div>
        )}

        {/* Users Table */}
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profile.avatar ? (
                            <img
                              src={user.profile.avatar}
                              alt={user.username}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile.name}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.isEmailVerified && (
                          <span className="text-xs text-green-600">✓ Verified</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateRoleMutation.isPending}
                            >
                              Change Role
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {user.role !== 'user' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user._id, user.username, 'user')
                                }
                              >
                                <UserIcon className="h-4 w-4 mr-2" />
                                User
                              </DropdownMenuItem>
                            )}
                            {user.role !== 'moderator' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user._id, user.username, 'moderator')
                                }
                              >
                                <UserCog className="h-4 w-4 mr-2" />
                                Moderator
                              </DropdownMenuItem>
                            )}
                            {user.role !== 'admin' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user._id, user.username, 'admin')
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total}{' '}
                users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
