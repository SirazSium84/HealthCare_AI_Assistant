import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, Activity, FileText, Zap } from 'lucide-react'

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'processing' | 'secure'
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function StatusBadge({ 
  status, 
  text, 
  className, 
  size = 'md',
  animated = true 
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          bg: 'bg-green-500/20',
          border: 'border-green-500/40',
          text: 'text-green-300',
          iconColor: 'text-green-400'
        }
      case 'error':
        return {
          icon: XCircle,
          bg: 'bg-red-500/20',
          border: 'border-red-500/40',
          text: 'text-red-300',
          iconColor: 'text-red-400'
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/40',
          text: 'text-yellow-300',
          iconColor: 'text-yellow-400'
        }
      case 'info':
        return {
          icon: Activity,
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/40',
          text: 'text-blue-300',
          iconColor: 'text-blue-400'
        }
      case 'processing':
        return {
          icon: Clock,
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/40',
          text: 'text-purple-300',
          iconColor: 'text-purple-400'
        }
      case 'secure':
        return {
          icon: Shield,
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/40',
          text: 'text-cyan-300',
          iconColor: 'text-cyan-400'
        }
    }
  }

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3'
        }
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'h-6 w-6'
        }
      default:
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-4 w-4'
        }
    }
  }

  const config = getStatusConfig()
  const sizeConfig = getSizeConfig()
  const Icon = config.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-xl border transition-all duration-300',
      config.bg,
      config.border,
      config.text,
      sizeConfig.container,
      animated && status === 'processing' && 'animate-pulse',
      animated && status === 'secure' && 'animate-glow',
      className
    )}>
      <Icon className={cn(sizeConfig.icon, config.iconColor, animated && status === 'processing' && 'animate-spin')} />
      <span className="font-medium">{text}</span>
    </div>
  )
}

interface DocumentCounterProps {
  count: number
  className?: string
  animated?: boolean
}

export function DocumentCounter({ count, className, animated = true }: DocumentCounterProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-xl',
      animated && 'animate-fade-in',
      className
    )}>
      <FileText className="h-4 w-4 text-green-400" />
      <span className="text-sm font-medium text-green-400">
        {count} document{count !== 1 ? 's' : ''} ready
      </span>
    </div>
  )
}

interface SystemStatusProps {
  className?: string
}

export function SystemStatus({ className }: SystemStatusProps) {
  return (
    <div className={cn('flex items-center gap-6 text-sm text-gray-400', className)}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>AI-Powered</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="h-3 w-3" />
        <span>Secure & Private</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-3 w-3" />
        <span>Real-time Analysis</span>
      </div>
    </div>
  )
}

interface UploadProgressProps {
  fileName: string
  progress?: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  className?: string
}

export function UploadProgress({ fileName, progress, status, className }: UploadProgressProps) {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading ${fileName}...`
      case 'processing':
        return `Processing ${fileName}...`
      case 'complete':
        return `✅ Successfully uploaded ${fileName}`
      case 'error':
        return `❌ Failed to upload ${fileName}`
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      case 'complete':
        return 'bg-green-500/20 text-green-300 border-green-500/40'
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/40'
    }
  }

  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all duration-300',
      getStatusColor(),
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{getStatusText()}</span>
        {progress && (
          <span className="text-xs opacity-75">{progress}%</span>
        )}
      </div>
      
      {(status === 'uploading' || status === 'processing') && (
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ 
              width: progress ? `${progress}%` : '60%',
              animation: !progress ? 'loading 2s ease-in-out infinite' : undefined
            }}
          />
        </div>
      )}
    </div>
  )
}

interface FeatureHighlightProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  className?: string
}

export function FeatureHighlight({ 
  icon, 
  title, 
  description, 
  gradient, 
  className 
}: FeatureHighlightProps) {
  return (
    <div className={cn(
      'group p-6 glass border border-gray-600/50 rounded-2xl hover:border-gray-500/50 transition-all duration-300 shadow-professional',
      className
    )}>
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg',
        gradient
      )}>
        {icon}
      </div>
      <h4 className="font-semibold text-white mb-2 text-center">{title}</h4>
      <p className="text-sm text-gray-400 text-center leading-relaxed">{description}</p>
    </div>
  )
} 