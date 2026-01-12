'use client'

export type ViewMode = 'list' | 'map'

export interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ currentView, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onViewChange('list')}
        aria-label='List view'
        className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
          currentView === 'list'
            ? 'bg-primary-700 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-gray-500'
        }`}
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
        </svg>
        <span className='hidden sm:inline'>List</span>
      </button>
      <button
        onClick={() => onViewChange('map')}
        aria-label='Map view'
        className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
          currentView === 'map'
            ? 'bg-primary-700 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-gray-500'
        }`}
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7'
          />
        </svg>
        <span className='hidden sm:inline'>Map</span>
      </button>
    </div>
  )
}
