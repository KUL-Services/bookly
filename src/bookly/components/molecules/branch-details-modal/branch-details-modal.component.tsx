'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, MapPin, Phone, Clock, Users, Scissors, ChevronRight, Star, Info, CheckCircle2 } from 'lucide-react'
import type { Service as ApiService, Branch, Staff } from '@/lib/api'

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: Branch
  businessName: string
  businessImage?: string
  services: ApiService[]
  staff: Staff[]
  allBranches: Branch[]
  onBranchChange: (branch: Branch) => void
  onBookService: (serviceId: string) => void
}

type TabId = 'overview' | 'services' | 'staff'

export function BranchDetailsModal({
  isOpen,
  onClose,
  branch,
  businessName,
  businessImage,
  services,
  staff,
  allBranches,
  onBranchChange,
  onBookService
}: BranchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isClosing, setIsClosing] = useState(false)

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview')
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filter staff for this branch
  const branchStaff = useMemo(() => {
    return staff.filter(s => s.branchId === branch.id) || staff.slice(0, 5)
  }, [staff, branch.id])

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Info className='w-4 h-4' /> },
    { id: 'services', label: 'Services', icon: <Scissors className='w-4 h-4' /> },
    { id: 'staff', label: 'Staff', icon: <Users className='w-4 h-4' /> }
  ]

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[100] ${isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'}`}
      style={{ touchAction: 'none' }}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={handleClose} />

      {/* Modal - Bottom Sheet Style on Mobile */}
      <div
        className={`absolute bottom-0 left-0 right-0 lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-lg lg:w-full lg:mx-4 bg-white dark:bg-[#1a2e35] rounded-t-[2rem] lg:rounded-[2rem] max-h-[92vh] lg:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl ${
          isClosing ? 'animate-out slide-out-to-bottom duration-200' : 'animate-in slide-in-from-bottom duration-300'
        }`}
      >
        {/* Drag Handle - Mobile Only */}
        <div className='lg:hidden flex justify-center pt-3 pb-2'>
          <div className='w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full' />
        </div>

        {/* Header */}
        <div className='relative px-5 pt-2 pb-4 border-b border-gray-100 dark:border-white/10'>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className='absolute right-4 top-2 lg:top-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors touch-manipulation'
          >
            <X className='w-5 h-5' />
          </button>

          {/* Branch Info */}
          <div className='flex items-start gap-4 pr-12'>
            {/* Logo/Avatar */}
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9b87f5] to-[#7c3aed] flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0'>
              {getInitials(businessName)}
            </div>

            <div className='flex-1 min-w-0'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2'>
                {branch.name}
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>{businessName}</p>

              {/* Quick Info Pills */}
              <div className='flex flex-wrap gap-2 mt-3'>
                <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-300'>
                  <MapPin className='w-3 h-3' />
                  <span className='truncate max-w-[120px]'>{branch.address}</span>
                </span>
                {branch.mobile && (
                  <a
                    href={`tel:${branch.mobile}`}
                    className='inline-flex items-center gap-1 px-2.5 py-1 bg-[#0a2c24]/10 dark:bg-[#77b6a3]/20 rounded-lg text-xs text-[#0a2c24] dark:text-[#77b6a3] font-medium'
                  >
                    <Phone className='w-3 h-3' />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20'>
          <div className='flex gap-2'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] shadow-md'
                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className='flex-1 overflow-y-auto overscroll-contain'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='p-5 space-y-6'>
              {/* Contact Section */}
              <div>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
                  <Phone className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                  Contact
                </h3>
                <a
                  href={`tel:${branch.mobile}`}
                  className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors touch-manipulation'
                >
                  <div className='w-10 h-10 rounded-full bg-[#0a2c24]/10 dark:bg-[#77b6a3]/20 flex items-center justify-center'>
                    <Phone className='w-5 h-5 text-[#0a2c24] dark:text-[#77b6a3]' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-base font-semibold text-gray-900 dark:text-white'>
                      {branch.mobile || '+971-4-234-5678'}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>Tap to call</p>
                  </div>
                  <ChevronRight className='w-5 h-5 text-gray-400' />
                </a>
              </div>

              {/* Quick Info Grid */}
              <div>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
                  <Info className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                  Quick Info
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl text-center'>
                    <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>{services.length}</p>
                    <p className='text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mt-1'>Services</p>
                  </div>
                  <div className='p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl text-center'>
                    <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                      {branchStaff.length || staff.length}
                    </p>
                    <p className='text-xs font-medium text-green-600/70 dark:text-green-400/70 mt-1'>Staff Members</p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                  Location
                </h3>
                <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl'>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{branch.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branch.address || '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-3 flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-white/10 rounded-xl text-sm font-semibold text-[#0a2c24] dark:text-[#77b6a3] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15 transition-colors touch-manipulation'
                  >
                    <MapPin className='w-4 h-4' />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className='p-4 space-y-3'>
              {services.length > 0 ? (
                services.map((service, index) => (
                  <div
                    key={service.id || index}
                    className='p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-base font-bold text-gray-900 dark:text-white line-clamp-1'>
                          {service.name}
                        </h4>
                        <div className='flex items-center gap-3 mt-1.5'>
                          <span className='inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                            <Clock className='w-3.5 h-3.5' />
                            {service.duration} min
                          </span>
                        </div>
                        {service.description && (
                          <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2'>
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='text-lg font-bold text-[#0a2c24] dark:text-[#77b6a3]'>EGP {service.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onBookService(service.id)}
                      className='mt-3 w-full py-2.5 bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-[0.98] touch-manipulation'
                    >
                      Book
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-center py-12'>
                  <Scissors className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
                  <p className='text-gray-500 dark:text-gray-400'>No services available</p>
                </div>
              )}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className='p-4'>
              {(branchStaff.length > 0 ? branchStaff : staff).length > 0 ? (
                <div className='grid grid-cols-2 gap-3'>
                  {(branchStaff.length > 0 ? branchStaff : staff).map((member, index) => (
                    <div
                      key={member.id || index}
                      className='p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-center'
                    >
                      <div className='w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0a2c24] to-[#2a9d8f] p-0.5 mb-3'>
                        <img
                          src={
                            (member as any).image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                          }
                          alt={member.name}
                          className='w-full h-full rounded-full object-cover bg-white dark:bg-[#1a2e35]'
                        />
                      </div>
                      <h4 className='text-sm font-bold text-gray-900 dark:text-white line-clamp-1'>{member.name}</h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Specialist</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Users className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
                  <p className='text-gray-500 dark:text-gray-400'>No staff information available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Safe Area */}
        <div className='h-[env(safe-area-inset-bottom)] bg-white dark:bg-[#1a2e35]' />
      </div>
    </div>
  )
}

export default BranchDetailsModal
