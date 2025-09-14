"use client"

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// Calendar Imports
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

// Data Imports
import { mockBookings } from '@/bookly/data/mock-data'

function parseTime12h(time: string) {
  // e.g., '3:00 PM'
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return { hours: 9, minutes: 0 }
  let hours = parseInt(m[1], 10)
  const minutes = parseInt(m[2], 10)
  const ampm = m[3].toUpperCase()
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return { hours, minutes }
}

const BooklyCalendarPage = () => {
  const events = useMemo(
    () =>
      mockBookings.map(b => {
        const d = new Date(b.date)
        const { hours, minutes } = parseTime12h(b.time)
        d.setHours(hours, minutes, 0, 0)
        const end = new Date(d.getTime() + b.duration * 60 * 1000)
        return {
          id: b.id,
          title: `${b.serviceName} — ${b.staffMemberName}`,
          start: d,
          end,
          color: b.status === 'cancelled' ? '#ef4444' : b.status === 'completed' ? '#9ca3af' : b.status === 'confirmed' ? '#3b82f6' : '#f59e0b'
        }
      }),
    []
  )

  return (
    <Card>
      <CardHeader title='Calendar' subheader='Daily, weekly, and monthly views' />
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView='dayGridMonth'
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' }}
          height={700}
          events={events}
        />
      </CardContent>
    </Card>
  )
}

export default BooklyCalendarPage

