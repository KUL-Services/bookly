type PageProps = {
  params?: {
    locale: 'ar' | 'en'
    [key: string]: string
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}
export default PageProps
