import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Brain, Activity, FileSearch } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'healthcare' | 'document' | 'thinking'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const getIcon = () => {
    switch (variant) {
      case 'healthcare':
        return <Activity className={cn(sizes[size], 'animate-spin')} />
      case 'document':
        return <FileSearch className={cn(sizes[size], 'animate-spin')} />
      case 'thinking':
        return <Brain className={cn(sizes[size], 'animate-pulse')} />
      default:
        return <Loader2 className={cn(sizes[size], 'animate-spin')} />
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {getIcon()}
      {text && <span className="text-sm text-gray-400">{text}</span>}
    </div>
  )
}

interface ProgressBarProps {
  progress?: number
  variant?: 'default' | 'healthcare' | 'gradient'
  className?: string
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  variant = 'default', 
  className,
  animated = true 
}: ProgressBarProps) {
  const getBarClass = () => {
    switch (variant) {
      case 'healthcare':
        return 'bg-blue-500'
      case 'gradient':
        return 'bg-gradient-to-r from-blue-400 via-purple-400 to-green-400'
      default:
        return 'bg-blue-400'
    }
  }

  return (
    <div className={cn('w-full bg-gray-700 rounded-full h-2 overflow-hidden', className)}>
      <div 
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          getBarClass(),
          animated && 'animate-pulse'
        )}
        style={{ 
          width: progress ? `${Math.min(Math.max(progress, 0), 100)}%` : '60%',
          animation: !progress && animated ? 'loading 2s ease-in-out infinite' : undefined
        }}
      />
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'message'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variants = {
    text: 'h-4 bg-gray-700 rounded animate-shimmer',
    card: 'h-32 bg-gray-700 rounded-xl animate-shimmer',
    message: 'h-16 bg-gray-700 rounded-2xl animate-shimmer'
  }

  return <div className={cn(variants[variant], className)} />
}

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
    </div>
  )
} 