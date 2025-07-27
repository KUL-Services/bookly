type PageProps<
  TParams extends Record<string, string> = Record<string, string> & { locale: 'ar' | 'en' },
  TSearchParams extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >
> = {
  params: TParams;
  searchParams?: TSearchParams;
};

export default PageProps;
