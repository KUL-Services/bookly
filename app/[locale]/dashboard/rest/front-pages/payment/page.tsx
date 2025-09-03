// Component Imports
import Payment from '@views/front-pages/Payment'

// Data Imports
import { getPricingData } from '@/bookly/app/[locale]/dashboard/rest/server/actions'

const PaymentPage = async () => {
  // Vars
  const data = await getPricingData()

  return <Payment data={data} />
}

export default PaymentPage
