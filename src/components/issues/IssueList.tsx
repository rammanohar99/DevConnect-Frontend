import { useState } from 'react'
import { IssueCard } from './IssueCard'
import { useInfiniteIssues } from '../../hooks/useIssues'
import { IssueFilters } from '../../services/issue.service'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Filter, Loader2 } from 'lucide-react'

interface IssueListProps {
  filters?: IssueFilters
}

export const IssueList = ({ filters: initialFilters }: IssueListProps) => {
  const [filters, setFilters] = useState<IssueFilters>(initialFilters || {})

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteIssues(filters, 10)

  const handleStatusFilter = (status?: IssueFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const handlePriorityFilter = (priority?: IssueFilters['priority']) => {
    setFilters((prev) => ({ ...prev, priority }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load issues. Please try again.</p>
      </div>
    )
  }

  const issues = data?.pages.flatMap((page) => page.issues) || []

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Status: {filters.status ? filters.status : 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusFilter(undefined)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('open')}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('in-progress')}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('closed')}>Closed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Priority: {filters.priority ? filters.priority : 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handlePriorityFilter(undefined)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityFilter('low')}>Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityFilter('medium')}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityFilter('high')}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityFilter('critical')}>
              Critical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(filters.status || filters.priority) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="text-gray-600"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Issue List */}
      {issues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No issues found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
