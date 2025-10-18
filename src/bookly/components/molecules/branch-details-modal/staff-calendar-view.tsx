import { useState, useMemo, useEffect } from 'react'
import { KulIcon } from '@/bookly/components/atoms'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import type { StaffMember, StaffAppointment } from '@/bookly/data/types'

interface StaffCalendarViewProps {
  staff: StaffMember[]
  t: (key: string) => string
  showActions?: boolean // Show edit/menu buttons (for business dashboard)
  showCustomerNames?: boolean // Show customer names (for business dashboard)
}

export const StaffCalendarView = ({ staff, t, showActions = false, showCustomerNames = false }: StaffCalendarViewProps) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 17)) // October 17, 2025
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')

  // Update selected staff when staff list changes (e.g., when switching branches)
  useEffect(() => {
    if (staff.length > 0 && !staff.find(s => s.id === selectedStaffId)) {
      setSelectedStaffId(staff[0].id)
    }
  }, [staff, selectedStaffId])

  const selectedStaff = useMemo(() => {
    return staff.find(s => s.id === selectedStaffId)
  }, [staff, selectedStaffId])

  // Generate week days based on selected date
  const weekDays = useMemo(() => {
    const days = []
    const startOfWeek = new Date(selectedDate)
    const dayOfWeek = startOfWeek.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust to Monday
    startOfWeek.setDate(startOfWeek.getDate() + diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  }, [selectedDate])

  // Get day schedule
  const getDaySchedule = (date: Date) => {
    if (!selectedStaff?.schedule) return null
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayName = dayNames[date.getDay()] as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
    return selectedStaff.schedule.find(s => s.dayOfWeek === dayName)
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): StaffAppointment[] => {
    if (!selectedStaff?.appointments) return []
    return selectedStaff.appointments.filter(apt => {
      return (
        apt.date.getDate() === date.getDate() &&
        apt.date.getMonth() === date.getMonth() &&
        apt.date.getFullYear() === date.getFullYear()
      )
    })
  }

  // Time slots for day view (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedDate(newDate)
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-300'
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-500 dark:border-gray-400 text-gray-700 dark:text-gray-300'
    }
  }

  if (staff.length === 0) {
    return (
      <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
        <KulIcon icon='lucide:calendar-off' className='w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600' />
        <p>No staff available for calendar view</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Staff Selector */}
      <div className='bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-700'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Select Staff Member
        </label>
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className='w-full px-4 py-3 rounded-lg border-2 border-teal-300 dark:border-teal-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all'
        >
          {staff.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} - {member.title}
            </option>
          ))}
        </select>
        {selectedStaff && (
          <div className='flex items-center gap-3 mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg'>
            <BusinessAvatar
              businessName={selectedStaff.name}
              imageSrc={selectedStaff.photo}
              className='w-12 h-12 rounded-full'
              size='md'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900 dark:text-gray-100'>{selectedStaff.name}</div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>{selectedStaff.title}</div>
            </div>
          </div>
        )}
      </div>

      {selectedStaff && (
        <>
          {/* Calendar Controls */}
          <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex-wrap gap-3'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => (viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev'))}
                className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                <KulIcon icon='lucide:chevron-left' className='w-5 h-5 text-gray-600 dark:text-gray-400' />
              </button>
              <div className='text-center min-w-[200px]'>
                <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  {viewMode === 'week'
                    ? `${weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={() => (viewMode === 'week' ? navigateWeek('next') : navigateDay('next'))}
                className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                <KulIcon icon='lucide:chevron-right' className='w-5 h-5 text-gray-600 dark:text-gray-400' />
              </button>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setSelectedDate(new Date(2025, 9, 17))}
                className='px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300'
              >
                Today
              </button>
              <div className='flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden'>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'day'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 text-sm transition-colors border-s border-gray-300 dark:border-gray-600 ${
                    viewMode === 'week'
                      ? 'bg-teal-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden'>
              <div className='grid grid-cols-8 border-b border-gray-200 dark:border-gray-600'>
                <div className='p-3 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400'>Time</div>
                {weekDays.map((day, index) => {
                  const schedule = getDaySchedule(day)
                  const isToday =
                    day.getDate() === new Date(2025, 9, 17).getDate() &&
                    day.getMonth() === new Date(2025, 9, 17).getMonth()

                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-s border-gray-200 dark:border-gray-600 ${
                        isToday ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          isToday
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      {schedule && !schedule.isAvailable && (
                        <div className='text-xs text-red-500 dark:text-red-400 mt-1'>Off</div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className='max-h-[400px] overflow-y-auto'>
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot} className='grid grid-cols-8 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30'>
                    <div className='p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 text-end pe-3 flex items-center justify-end'>
                      {timeSlot}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const schedule = getDaySchedule(day)
                      const appointments = getAppointmentsForDate(day).filter(apt => {
                        const aptHour = parseInt(apt.startTime.split(':')[0])
                        const slotHour = parseInt(timeSlot.split(':')[0])
                        return aptHour === slotHour
                      })

                      const isWorkingHour =
                        schedule &&
                        schedule.isAvailable &&
                        timeSlot >= schedule.startTime &&
                        timeSlot < schedule.endTime

                      return (
                        <div
                          key={dayIndex}
                          className={`p-1 border-s border-gray-100 dark:border-gray-700 min-h-[60px] ${
                            isWorkingHour
                              ? 'bg-white dark:bg-gray-800'
                              : 'bg-gray-50 dark:bg-gray-900/50'
                          }`}
                        >
                          {appointments.map((apt, aptIndex) => (
                            <div
                              key={aptIndex}
                              className={`text-xs p-2 rounded border-s-2 mb-1 ${getStatusColor(apt.status)}`}
                            >
                              <div className='font-medium truncate'>{apt.startTime}</div>
                              <div className='truncate'>{apt.serviceName}</div>
                              {showCustomerNames && (
                                <div className='truncate text-[10px] opacity-80'>{apt.customerName}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden'>
              <div className='border-b border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                      {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    {(() => {
                      const schedule = getDaySchedule(selectedDate)
                      return schedule ? (
                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                          {schedule.isAvailable ? (
                            <span className='flex items-center gap-2'>
                              <KulIcon icon='lucide:clock' className='w-4 h-4' />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          ) : (
                            <span className='text-red-500 dark:text-red-400 flex items-center gap-2'>
                              <KulIcon icon='lucide:calendar-off' className='w-4 h-4' />
                              Day Off
                            </span>
                          )}
                        </div>
                      ) : null
                    })()}
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-teal-600 dark:text-teal-400'>
                      {getAppointmentsForDate(selectedDate).filter(a => a.status !== 'cancelled').length}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Appointments
                    </div>
                  </div>
                </div>
              </div>

              <div className='max-h-[500px] overflow-y-auto p-4'>
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                    <KulIcon icon='lucide:calendar-check' className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                    <p>No appointments for this day</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {getAppointmentsForDate(selectedDate).map((apt, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${getStatusColor(apt.status)}`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <div className='flex items-center gap-2 text-sm font-semibold'>
                                <KulIcon icon='lucide:clock' className='w-4 h-4' />
                                {apt.startTime} - {apt.endTime}
                              </div>
                              <div className='px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800 border border-current capitalize'>
                                {apt.status}
                              </div>
                            </div>
                            <div className='font-medium text-base mb-1'>{apt.serviceName}</div>
                            {showCustomerNames && (
                              <div className='flex items-center gap-2 text-sm opacity-90'>
                                <KulIcon icon='lucide:user' className='w-4 h-4' />
                                {apt.customerName}
                              </div>
                            )}
                          </div>
                          {showActions && (
                            <div className='flex gap-2'>
                              <button className='p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors'>
                                <KulIcon icon='lucide:edit' className='w-4 h-4' />
                              </button>
                              <button className='p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors'>
                                <KulIcon icon='lucide:more-vertical' className='w-4 h-4' />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className='flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex-wrap'>
            <div className='font-medium'>Status:</div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-green-500'></div>
              <span>Confirmed</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-yellow-500'></div>
              <span>Pending</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-blue-500'></div>
              <span>Completed</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded bg-red-500'></div>
              <span>Cancelled</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
