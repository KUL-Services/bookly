// Component Imports
import PricingWrapper from '@/views/front-pages/pricing'

// Data Imports
import { getPricingData } from '@/bookly/app/[locale]/dashboard/rest/server/actions'

const PricingPage = async () => {
  // Vars
  const data = await getPricingData()

  return <PricingWrapper data={data} />
}

export default PricingPage
