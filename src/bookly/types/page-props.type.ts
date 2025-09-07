type PageProps<
  TParams extends Record<string, string> = Record<string, string> & { lang: 'ar' | 'en' | 'fr' },
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
> = {
  params: TParams
  searchParams?: TSearchParams
}

export default PageProps
