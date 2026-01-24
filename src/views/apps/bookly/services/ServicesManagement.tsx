'use client'

import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import { ServicesTab } from '@/bookly/features/staff-management/services-tab'
import { BranchesTab } from '@/bookly/features/branches'
import { BrandWatermark } from '@/bookly/components/atoms/brand-watermark'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role='tabpanel' hidden={value !== index} {...other} style={{ height: '100%' }}>
      {value === index && children}
    </div>
  )
}

const ServicesManagement = () => {
  const [currentTab, setCurrentTab] = useState(0)

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative'
      }}
    >
      {/* Brand Watermark Overlay */}
      <BrandWatermark placement='top-right' size={400} opacity={0.03} rotate={10} />

      {/* Tabs Header */}
      <Box
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', zIndex: 1, position: 'relative' }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ px: 3 }}
          variant='scrollable'
          scrollButtons='auto'
        >
          <Tab label='SERVICES' sx={{ textTransform: 'uppercase', fontWeight: 600, fontFamily: 'inherit' }} />
          <Tab label='BRANCHES' sx={{ textTransform: 'uppercase', fontWeight: 600, fontFamily: 'inherit' }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={currentTab} index={0}>
          <ServicesTab />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <BranchesTab />
        </TabPanel>
      </Box>
    </Box>
  )
}

export default ServicesManagement
