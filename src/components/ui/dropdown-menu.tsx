import * as React from 'react'
import { cn } from '../../lib/utils'

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
    })
  }
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ className, align = 'start', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
        align === 'end' ? 'right-0' : 'left-0',
        'mt-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100',
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

// Simple implementation without Radix UI
const DropdownMenuWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenuTrigger
  )
  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenuContent
  )

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {trigger &&
        React.cloneElement(trigger as React.ReactElement, {
          onClick: () => setIsOpen(!isOpen),
        })}
      {isOpen && content}
    </div>
  )
}

export {
  DropdownMenuWrapper as DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
