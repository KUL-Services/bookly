'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, Tabs, Tab } from '@mui/material'
import { StaffMembersTab } from '@/bookly/features/staff-management/staff-members-tab'
import { ShiftsTab } from '@/bookly/features/staff-management/shifts-tab'
import { ResourcesTab } from '@/bookly/features/staff-management/resources-tab'
import { CommissionsTab } from '@/bookly/features/staff-management/commissions-tab'
import { useStaffManagementStore } from '@/bookly/features/staff-management/staff-store'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && children}
    </div>
  )
}

const StaffManagement = () => {
  const searchParams = useSearchParams()
  const [currentTab, setCurrentTab] = useState(0)

  // Staff management store
  const isTimeOffOpen = useStaffManagementStore(state => state.isTimeOffOpen)
  const isTimeReservationOpen = useStaffManagementStore(state => state.isTimeReservationOpen)
  const toggleTimeOff = useStaffManagementStore(state => state.toggleTimeOff)
  const toggleTimeReservation = useStaffManagementStore(state => state.toggleTimeReservation)

  // Check URL parameters to open modals
  useEffect(() => {
    const action = searchParams?.get('action')

    if (action === 'time-off') {
      if (!isTimeOffOpen) {
        toggleTimeOff()
      }
    } else if (action === 'time-reservation') {
      if (!isTimeReservationOpen) {
        toggleTimeReservation()
      }
    }
  }, [searchParams, isTimeOffOpen, isTimeReservationOpen, toggleTimeOff, toggleTimeReservation])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ px: 3 }}
        >
          <Tab label="STAFF MEMBERS" sx={{ textTransform: 'uppercase', fontWeight: 600 }} />
          <Tab label="SHIFTS" sx={{ textTransform: 'uppercase', fontWeight: 600 }} />
          <Tab label="RESOURCES" sx={{ textTransform: 'uppercase', fontWeight: 600 }} />
          <Tab label="COMMISSIONS" sx={{ textTransform: 'uppercase', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={currentTab} index={0}>
          <StaffMembersTab />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <ShiftsTab />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <ResourcesTab />
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <CommissionsTab />
        </TabPanel>
      </Box>
    </Box>
  )
}

export default StaffManagement
