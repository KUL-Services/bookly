'use server';

import initTranslations from '@/app/i18n/i18n';
import { H1 } from '@/components/atoms';
import WideBar from '@/components/templates/wide-bar/wide-bar.component';
import { PageProps } from '@/types';

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ['common']);

  const renderH1Component = (
    <H1 stringProps={{ localeKey: 'headerTemp' }} i18nTFn={t} />
  );

  return (
    <div className='flex flex-1 content-center items-center'>
      <H1
        stringProps={{
          localeKey: 'helloPerson',
          localeProps: { userName: 'Spirit' },
        }}
        i18nTFn={t}
      />

      <WideBar myTextComponent={renderH1Component} />
      
      <H1 stringProps={{plainText: 'Below me should be a CSR text'}}></H1>
      <H1 stringProps={{localeKey: 'footerTemp'}}></H1>
    </div>
  );
}
