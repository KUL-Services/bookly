import { redirect } from 'next/navigation'

type Props = {
  params: { lang: string; slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CategoryRedirect({ params }: Props) {
  const { lang, slug } = params

  // Redirect to the search page with the selected category
  redirect(`/${lang}/search?category=${encodeURIComponent(slug)}`)
}

