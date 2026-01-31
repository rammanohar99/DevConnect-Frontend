import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { IssueList } from '../../components/issues/IssueList'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export const Issues = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Issues</h1>
          <p className="text-gray-600 mt-1">Track and manage project issues</p>
        </div>
        {user && (
          <Button onClick={() => navigate('/issues/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        )}
      </div>

      <IssueList />
    </div>
  )
}
