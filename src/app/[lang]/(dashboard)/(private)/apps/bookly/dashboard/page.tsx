import DashboardBookly from '@/views/apps/bookly/dashboard/DashboardBookly'

const BooklyDashboardPage = ({ params }: { params: { lang: string } }) => {
  return <DashboardBookly lang={params.lang} />
}

export default BooklyDashboardPage
