'use client'

import { CircularProgress, Skeleton, Card, CardContent, Box } from '@mui/material'
import { Loader2 } from 'lucide-react'

// Full page loading component
export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center space-y-4">
      <CircularProgress size={48} className="text-primary-800" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
)

// Card skeleton for dashboard widgets
export const CardSkeleton = ({ height = '200px' }: { height?: string }) => (
  <Card className="w-full">
    <CardContent>
      <Box className="space-y-3">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rectangular" width="100%" height={height} />
        <div className="flex justify-between">
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="20%" height={20} />
        </div>
      </Box>
    </CardContent>
  </Card>
)

// Table skeleton for data tables
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <Card className="w-full">
    <CardContent>
      <Box className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  width={colIndex === 0 ? "40%" : "20%"}
                  height={20}
                />
              ))}
            </div>
          ))}
        </div>
      </Box>
    </CardContent>
  </Card>
)

// Button loading state
export const ButtonLoader = ({ size = 16 }: { size?: number }) => (
  <Loader2 className={`animate-spin w-${size/4} h-${size/4}`} />
)

// Inline loading for smaller components
export const InlineLoader = ({ message = 'Loading...', size = 20 }: { message?: string; size?: number }) => (
  <div className="flex items-center space-x-2">
    <CircularProgress size={size} className="text-primary-800" />
    <span className="text-gray-600 text-sm">{message}</span>
  </div>
)

// Stats card skeleton for dashboard
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={28} />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Form skeleton for dialogs
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <Box className="space-y-6 p-4">
    <Skeleton variant="text" width="40%" height={32} />
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="rectangular" width="100%" height={56} />
      </div>
    ))}
    <div className="flex justify-end space-x-3 pt-4">
      <Skeleton variant="rectangular" width={80} height={36} />
      <Skeleton variant="rectangular" width={80} height={36} />
    </div>
  </Box>
)

// Search results skeleton
export const SearchResultsSkeleton = ({ items = 6 }: { items?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <Card key={index} className="w-full">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Skeleton variant="rectangular" width={120} height={80} className="rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="100%" height={16} />
              <div className="flex space-x-2">
                <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
                <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Loading overlay for existing content
export const LoadingOverlay = ({ message = 'Loading...', transparent = false }) => (
  <div className={`absolute inset-0 flex items-center justify-center z-50 ${
    transparent ? 'bg-white/50' : 'bg-white/80'
  } backdrop-blur-sm`}>
    <div className="flex flex-col items-center space-y-3">
      <CircularProgress size={32} className="text-primary-800" />
      <p className="text-gray-600 font-medium text-sm">{message}</p>
    </div>
  </div>
)