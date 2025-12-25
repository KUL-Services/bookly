import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import initTranslations from '@/app/i18n/i18n'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Button } from '@/bookly/components/molecules'
import { KulIcon } from '@/bookly/components/atoms'
import { StaffCalendarView } from './staff-calendar-view'
import { mockStaff } from '@/bookly/data/mock-data'
import type { Branch, Service, Staff } from '@/lib/api'
import type { StaffMember, StaffAppointment } from '@/bookly/data/types'

// Helper function to generate sample appointments for staff
const generateSampleAppointments = (staffId: string): StaffAppointment[] => {
  const today = new Date(2025, 9, 17)
  const appointments: StaffAppointment[] = []
  const services = ['Haircut', 'Color Treatment', 'Massage', 'Facial', 'Manicure', 'Training Session']
  const customers = ['Ahmed Ali', 'Sara Mohamed', 'John Smith', 'Emma Davis', 'Michael Brown', 'Lisa Chen']

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)

    const appointmentCount = Math.floor(Math.random() * 4) + 2 // 2-5 appointments per day

    for (let i = 0; i < appointmentCount; i++) {
      const hour = 9 + Math.floor(Math.random() * 8)
      const minute = Math.random() > 0.5 ? '00' : '30'
      const duration = [30, 60, 90][Math.floor(Math.random() * 3)]

      const startTime = `${hour.toString().padStart(2, '0')}:${minute}`
      const endHour = hour + Math.floor(duration / 60)
      const endMinute = (parseInt(minute) + (duration % 60)).toString().padStart(2, '0')
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`

      let status: 'confirmed' | 'pending' | 'completed' | 'cancelled' = 'confirmed'
      if (Math.random() > 0.9) status = 'cancelled'
      else if (Math.random() > 0.8) status = 'pending'

      appointments.push({
        id: `apt-${staffId}-${dayOffset}-${i}`,
        date,
        startTime,
        endTime,
        serviceName: services[Math.floor(Math.random() * services.length)],
        customerName: customers[Math.floor(Math.random() * customers.length)],
        status
      })
    }
  }

  return appointments.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime()
    return a.startTime.localeCompare(b.startTime)
  })
}

// Dynamically import map component to avoid SSR issues
const BranchMapView = dynamic(() => import('./branch-map-view'), {
  ssr: false,
  loading: () => (
    <div className='bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center'>
      <div className='text-gray-500 dark:text-gray-400'>Loading map...</div>
    </div>
  )
})

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: Branch
  businessName: string
  businessImage?: string
  services?: Service[]
  staff?: Staff[]
  staffMembers?: StaffMember[] // Optional: If provided, will be used for calendar view with full data
  allBranches?: Branch[]
  onBranchChange?: (branch: Branch) => void
  onBookService?: (serviceId: string) => void
}

export const BranchDetailsModal = ({
  isOpen,
  onClose,
  branch,
  businessName,
  businessImage,
  services = [],
  staff = [],
  staffMembers,
  allBranches = [],
  onBranchChange,
  onBookService
}: BranchDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'staff' | 'calendar'>('overview')
  const params = useParams<{ lang: string }>()
  const [t, setT] = useState<any>(() => (key: string) => key)

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations((params?.lang || 'en') as 'en' | 'ar' | 'fr', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params?.lang])

  if (!isOpen) return null

  const branchServices = services.filter(
    service =>
      !service.branches ||
      service.branches.length === 0 ||
      service.branches.some(serviceBranch => serviceBranch.id === branch.id)
  )

  const branchStaff = staff.filter(member => member.branchId === branch.id)

  // Convert API Staff to StaffMember format with schedule data
  const branchStaffMembers = useMemo(() => {
    // If custom staffMembers provided, use them
    if (staffMembers && staffMembers.length > 0) {
      return staffMembers.filter(member => member.branchId === branch.id)
    }

    // Convert branchStaff (from API) to StaffMember format with mock schedule data
    if (branchStaff.length > 0) {
      return branchStaff.map((apiStaff, index) => {
        // Try to find matching mock staff for schedule data
        const mockStaffMatch = mockStaff.find(m => m.branchId === branch.id && m.id === apiStaff.id)

        // Get schedule based on index (cycle through different schedules)
        const schedules = [
          [
            { dayOfWeek: 'Mon' as const, startTime: '08:00', endTime: '19:00', isAvailable: true },
            { dayOfWeek: 'Tue' as const, startTime: '08:00', endTime: '19:00', isAvailable: true },
            { dayOfWeek: 'Wed' as const, startTime: '08:00', endTime: '19:00', isAvailable: true },
            { dayOfWeek: 'Thu' as const, startTime: '08:00', endTime: '20:00', isAvailable: true },
            { dayOfWeek: 'Fri' as const, startTime: '08:00', endTime: '20:00', isAvailable: true },
            { dayOfWeek: 'Sat' as const, startTime: '08:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 'Sun' as const, startTime: '10:00', endTime: '16:00', isAvailable: true }
          ],
          [
            { dayOfWeek: 'Mon' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'Tue' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'Wed' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { dayOfWeek: 'Thu' as const, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 'Fri' as const, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { dayOfWeek: 'Sat' as const, startTime: '08:00', endTime: '16:00', isAvailable: true },
            { dayOfWeek: 'Sun' as const, startTime: '10:00', endTime: '15:00', isAvailable: false }
          ]
        ]

        const staffMember: StaffMember = {
          id: apiStaff.id,
          name: apiStaff.name,
          title: 'Staff Member', // API doesn't have title, use generic
          photo: apiStaff.profilePhotoUrl || '',
          businessId: apiStaff.businessId || '',
          branchId: apiStaff.branchId,
          schedule: mockStaffMatch?.schedule || schedules[index % schedules.length],
          appointments: mockStaffMatch?.appointments || generateSampleAppointments(apiStaff.id)
        }

        return staffMember
      })
    }

    // Fallback to mock staff data if no API staff
    const matchedStaff = mockStaff.filter(member => member.branchId === branch.id)
    if (matchedStaff.length > 0) {
      return matchedStaff
    }

    // Last resort: return first 3 mock staff as examples
    return mockStaff.slice(0, 3)
  }, [staffMembers, branchStaff, branch.id])

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Modal Container with Backdrop Click */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4'
        onClick={onClose}
      >
        <div
          className='bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl'
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='relative'>
            <div className='bg-gradient-to-r from-primary-700 to-blue-600 p-6 text-white'>
              <button
                onClick={onClose}
                className='absolute top-4 end-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors'
              >
                <KulIcon icon='lucide:x' className='w-5 h-5' />
              </button>

              <div className='flex items-start gap-4'>
                <BusinessAvatar
                  businessName={businessName}
                  imageSrc={businessImage}
                  className='w-16 h-16 rounded-lg border-2 border-white'
                  size='xl'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-1'>
                    <h2 className='text-2xl font-bold'>{branch.name}</h2>
                    {allBranches.length > 1 && (
                      <select
                        value={branch.id}
                        onChange={e => {
                          const selectedBranch = allBranches.find(b => b.id === e.target.value)
                          if (selectedBranch && onBranchChange) {
                            onBranchChange(selectedBranch)
                          }
                        }}
                        className='bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
                      >
                        {allBranches.map(b => (
                          <option key={b.id} value={b.id} className='text-gray-900'>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className='text-white text-opacity-90 mb-2'>{businessName}</p>
                  <div className='flex items-center gap-2 text-white text-opacity-80'>
                    <KulIcon icon='lucide:map-pin' className='w-4 h-4' />
                    <span className='text-sm'>{branch.address}</span>
                  </div>
                  {branch.mobile && (
                    <div className='flex items-center gap-2 text-white text-opacity-80 mt-1'>
                      <KulIcon icon='lucide:phone' className='w-4 h-4' />
                      <span className='text-sm'>{branch.mobile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className='border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600'>
              <div className='flex overflow-x-auto'>
                {[
                  { id: 'overview', label: t('business.branchDetails.overview'), icon: 'lucide:info' },
                  { id: 'services', label: t('business.branchDetails.services'), icon: 'lucide:scissors' },
                  { id: 'staff', label: t('business.branchDetails.staff'), icon: 'lucide:users' },
                  { id: 'calendar', label: t('business.branchDetails.calendar'), icon: 'lucide:calendar-days' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-primary-800 border-primary-800 bg-white dark:bg-gray-800 dark:text-sage-400 dark:border-sage-400'
                        : 'text-gray-600 dark:text-white border-transparent hover:text-gray-800 dark:hover:text-sage-300 hover:border-gray-300 dark:hover:border-sage-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <KulIcon icon={tab.icon} className='w-4 h-4' />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-6 max-h-[60vh] overflow-y-auto'>
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                {/* Location */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                    {t('business.branchDetails.location')}
                  </h3>
                  <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4'>
                    <p className='text-gray-700 dark:text-gray-300 mb-2'>{branch.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || '')}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 text-primary-800 hover:text-primary-900 dark:text-sage-400 dark:hover:text-sage-300 text-sm'
                    >
                      <KulIcon icon='lucide:external-link' className='w-4 h-4' />
                      {t('business.branchDetails.viewOnGoogleMaps')}
                    </a>
                  </div>
                  {/* Map View */}
                  <div className='rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600'>
                    <BranchMapView branch={branch} />
                  </div>
                </div>

                {/* Contact */}
                {branch.mobile && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                      {t('business.branchDetails.contact')}
                    </h3>
                    <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
                      <div className='flex items-center gap-2'>
                        <KulIcon icon='lucide:phone' className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                        <a
                          href={`tel:${branch.mobile}`}
                          className='text-primary-800 hover:text-primary-900 dark:text-sage-400 dark:hover:text-sage-300'
                        >
                          {branch.mobile}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {branch.galleryUrls && branch.galleryUrls.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                      {t('business.branchDetails.gallery') || 'Gallery'}
                    </h3>

                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                      {branch.galleryUrls.map((imageUrl, index) => (
                        <div key={index} className='relative group'>
                          <div className='aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700'>
                            <img
                              src={imageUrl}
                              alt={`${branch.name} ${t('business.branchDetails.galleryImageAlt') || 'gallery image'} ${index + 1}`}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                              onError={e => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder-image.jpg'
                              }}
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300' />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                    {t('business.branchDetails.quickInfo')}
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center'>
                      <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{branchServices.length}</div>
                      <div className='text-sm text-blue-600 dark:text-blue-400'>
                        {t('business.branchDetails.servicesCount')}
                      </div>
                    </div>
                    <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center'>
                      <div className='text-2xl font-bold text-green-600 dark:text-green-400'>{branchStaff.length}</div>
                      <div className='text-sm text-green-600 dark:text-green-400'>
                        {t('business.branchDetails.staffMembersCount')}
                      </div>
                    </div>
                    <div className='bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center'>
                      <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>4.8</div>
                      <div className='text-sm text-purple-600 dark:text-purple-400'>
                        {t('business.branchDetails.ratingLabel')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                  {t('business.branchDetails.availableServices')}
                </h3>
                {branchServices.length === 0 ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    <KulIcon
                      icon='lucide:scissors'
                      className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600'
                    />
                    <p>{t('business.branchDetails.noServicesTitle')}</p>
                  </div>
                ) : (
                  <div className='grid gap-4'>
                    {branchServices.map(service => (
                      <div
                        key={service.id}
                        className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-200 dark:hover:border-primary-800 transition-colors bg-white dark:bg-gray-800'
                      >
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900 dark:text-gray-100'>{service.name}</h4>
                          {service.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{service.description}</p>
                          )}
                          <div className='flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400'>
                            <span className='flex items-center gap-1'>
                              <KulIcon icon='lucide:clock' className='w-4 h-4' />
                              {service.duration} {t('business.branchDetails.duration')}
                            </span>
                            <span className='font-medium text-primary-800 dark:text-sage-400'>£{service.price}</span>
                          </div>
                        </div>
                        <Button
                          buttonText={{ plainText: t('business.branchDetails.bookNow') }}
                          variant='contained'
                          className='bg-primary-700 hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-900 text-white'
                          onClick={() => onBookService?.(service.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                  {t('business.branchDetails.ourTeam')}
                </h3>
                {branchStaff.length === 0 ? (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    <KulIcon icon='lucide:users' className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                    <p>{t('business.branchDetails.noStaffTitle')}</p>
                  </div>
                ) : (
                  <div className='grid md:grid-cols-2 gap-4'>
                    {branchStaff.map(member => (
                      <div
                        key={member.id}
                        className='flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800'
                      >
                        <BusinessAvatar businessName={member.name} className='w-12 h-12 rounded-full' size='md' />
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900 dark:text-gray-100'>{member.name}</h4>
                          {member.mobile && <p className='text-sm text-gray-600 dark:text-gray-400'>{member.mobile}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                  {t('business.branchDetails.staffSchedule')}
                </h3>
                <StaffCalendarView staff={branchStaffMembers} t={t} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
