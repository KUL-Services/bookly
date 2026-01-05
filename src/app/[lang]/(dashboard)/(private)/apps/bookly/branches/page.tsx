import { redirect } from 'next/navigation'

const BooklyBranchesPage = ({ params }: { params: { lang: string } }) => {
  redirect(`/${params.lang}/apps/bookly/settings?tab=branches`)
}

export default BooklyBranchesPage
