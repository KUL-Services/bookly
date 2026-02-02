import { BusinessHeader } from '@/bookly/components/business/layout/BusinessHeader'
import { BusinessFooter } from '@/bookly/components/business/layout/BusinessFooter'
import { PromoBar } from '@/bookly/components/business/layout/PromoBar'

export default function BusinessLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex flex-col min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24]'>
      <PromoBar />
      <BusinessHeader />
      <main className='flex-grow'>{children}</main>
      <BusinessFooter />
    </div>
  )
}
