import { redirect } from 'next/navigation'

type Props = { params: { lang: string } }

export default function LangIndexPage({ params }: Props) {
  return redirect(`/${params.lang}/customer/login`)
}

