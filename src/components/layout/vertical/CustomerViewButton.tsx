'use client'

// React Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

// Icon Imports - Using RemixIcon instead of MUI icons

// Styled Component
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  minWidth: 'auto',
  padding: '6px 12px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2]
  },
  '& .MuiButton-startIcon': {
    marginRight: '6px'
  }
}))

const CustomerViewButton = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()

  const handleCustomerView = () => {
    console.log('Switching to customer view')
    // Navigate to customer landpage
    router.push(`/${params?.lang}/landpage`)
  }

  return (
    <Tooltip title="Switch to Customer View" placement="bottom">
      <StyledButton
        startIcon={<i className="ri-store-2-line text-base" />}
        onClick={handleCustomerView}
        size="small"
        className="customer-view-btn"
      >
        Customer View
      </StyledButton>
    </Tooltip>
  )
}

export default CustomerViewButton