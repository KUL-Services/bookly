import CalendarShell from '@/bookly/features/calendar/calendar-shell'

interface BooklyCalendarPageProps {
  params: {
    lang: string
  }
}

export default function BooklyCalendarPage({ params }: BooklyCalendarPageProps) {
  return <CalendarShell lang={params.lang} />
}
