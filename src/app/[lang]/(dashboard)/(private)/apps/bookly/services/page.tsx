import { redirect } from 'next/navigation'

const BooklyServicesPage = ({ params }: { params: { lang: string } }) => {
  redirect(`/${params.lang}/apps/bookly/settings?tab=services`)
}

export default BooklyServicesPage
