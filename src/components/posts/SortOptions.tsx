import { ArrowUpDown } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export type SortOption = 'date' | 'popularity' | 'relevance'

interface SortOptionsProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

const sortLabels: Record<SortOption, string> = {
  date: 'Most Recent',
  popularity: 'Most Popular',
  relevance: 'Most Relevant',
}

export const SortOptions = ({ currentSort, onSortChange }: SortOptionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Sort: {sortLabels[currentSort]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onSortChange('date')}
          className={currentSort === 'date' ? 'bg-gray-100' : ''}
        >
          Most Recent
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('popularity')}
          className={currentSort === 'popularity' ? 'bg-gray-100' : ''}
        >
          Most Popular
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('relevance')}
          className={currentSort === 'relevance' ? 'bg-gray-100' : ''}
        >
          Most Relevant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
