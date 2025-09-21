'use client'

import { AlertTriangle, RefreshCw, Wifi, Shield, Server } from 'lucide-react'
import { Alert, Button, Card, CardContent, Typography, Box } from '@mui/material'
import { isNetworkError, isAuthError, extractErrorMessage } from '@/utils/errorHandling'

interface ErrorDisplayProps {
  error: any
  onRetry?: () => void
  context?: string
  showDetails?: boolean
}

export const ErrorDisplay = ({ error, onRetry, context, showDetails = false }: ErrorDisplayProps) => {
  const message = extractErrorMessage(error)
  const isNetwork = isNetworkError(error)
  const isAuth = isAuthError(error)
  const statusCode = error?.statusCode || error?.response?.status

  const getErrorIcon = () => {
    if (isNetwork) return <Wifi className="h-5 w-5" />
    if (isAuth) return <Shield className="h-5 w-5" />
    if (statusCode >= 500) return <Server className="h-5 w-5" />
    return <AlertTriangle className="h-5 w-5" />
  }

  const getErrorColor = () => {
    if (isAuth) return 'warning'
    return 'error'
  }

  const getErrorTitle = () => {
    if (isNetwork) return 'Connection Problem'
    if (isAuth) return 'Access Denied'
    if (statusCode >= 500) return 'Server Error'
    return 'Error'
  }

  return (
    <Alert
      severity={getErrorColor()}
      icon={getErrorIcon()}
      action={
        onRetry && (
          <Button
            size="small"
            onClick={onRetry}
            startIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
        )
      }
    >
      <div>
        <Typography variant="subtitle2" component="div">
          {getErrorTitle()}
        </Typography>
        <Typography variant="body2">
          {message}
        </Typography>
        {showDetails && context && (
          <Typography variant="caption" color="textSecondary" component="div" className="mt-1">
            Context: {context}
          </Typography>
        )}
        {showDetails && statusCode && (
          <Typography variant="caption" color="textSecondary" component="div">
            Status: {statusCode}
          </Typography>
        )}
      </div>
    </Alert>
  )
}

export const ErrorCard = ({ error, onRetry, context }: ErrorDisplayProps) => {
  const message = extractErrorMessage(error)
  const isNetwork = isNetworkError(error)
  const isAuth = isAuthError(error)

  return (
    <Card className="w-full">
      <CardContent className="text-center py-8">
        <Box className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-red-100">
            {isNetwork && <Wifi className="h-8 w-8 text-red-600" />}
            {isAuth && <Shield className="h-8 w-8 text-orange-600" />}
            {!isNetwork && !isAuth && <AlertTriangle className="h-8 w-8 text-red-600" />}
          </div>

          <div>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              {isNetwork ? 'Connection Error' : isAuth ? 'Access Denied' : 'Something went wrong'}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="max-w-md mx-auto">
              {message}
            </Typography>
            {context && (
              <Typography variant="caption" color="textSecondary" className="block mt-2">
                {context}
              </Typography>
            )}
          </div>

          {onRetry && (
            <Button
              variant="outlined"
              onClick={onRetry}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export const InlineError = ({ error, onRetry }: { error: any; onRetry?: () => void }) => {
  const message = extractErrorMessage(error)

  return (
    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
        <span className="text-sm text-red-700">{message}</span>
      </div>
      {onRetry && (
        <Button size="small" onClick={onRetry} color="error">
          Retry
        </Button>
      )}
    </div>
  )
}

export const ErrorBoundary = ({ children, fallback }: {
  children: React.ReactNode
  fallback?: (error: Error) => React.ReactNode
}) => {
  try {
    return <>{children}</>
  } catch (error) {
    if (fallback && error instanceof Error) {
      return <>{fallback(error)}</>
    }

    return (
      <ErrorCard
        error={error}
        context="Component Error"
        onRetry={() => window.location.reload()}
      />
    )
  }
}

// Toast notification utility (to be used with your preferred toast library)
export const showErrorToast = (error: any) => {
  const message = extractErrorMessage(error)
  const isAuth = isAuthError(error)

  // This would integrate with your toast system (react-hot-toast, sonner, etc.)
  console.error('Toast Error:', { message, isAuth, error })

  // Example implementation with react-hot-toast:
  // if (isAuth) {
  //   toast.error(`🔒 ${message}`, { duration: 6000 })
  // } else {
  //   toast.error(`❌ ${message}`, { duration: 4000 })
  // }
}