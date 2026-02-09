import { PageLoader } from '@/components/LoadingStates'

export default function BooklyLoading() {
  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24]'>
      <PageLoader />
    </div>
  )
}
