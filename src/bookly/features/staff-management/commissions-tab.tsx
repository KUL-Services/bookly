'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Popover
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { CommissionEditorModal } from './commission-editor-modal'
import type { CommissionPolicy } from '../calendar/types'

type CommissionScope = 'serviceCategory' | 'service' | 'product' | 'giftCard' | 'membership' | 'package'

const SCOPE_LABELS: Record<CommissionScope, string> = {
  serviceCategory: 'Services',
  service: 'Individual Services',
  product: 'Products',
  giftCard: 'Gift Cards',
  membership: 'Memberships',
  package: 'Packages'
}

export function CommissionsTab() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<CommissionPolicy | null>(null)
  const [editingScope, setEditingScope] = useState<CommissionScope | null>(null)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialAnchor, setTutorialAnchor] = useState<HTMLElement | null>(null)

  const {
    commissionPolicies,
    getCommissionPolicies,
    deleteCommissionPolicy
  } = useStaffManagementStore()

  // Filter policies by selected staff
  const filteredPolicies = commissionPolicies.filter(policy => {
    if (selectedStaffId === 'all') {
      return policy.staffScope === 'all'
    } else {
      return policy.staffScope !== 'all' &&
             'staffIds' in policy.staffScope &&
             policy.staffScope.staffIds.includes(selectedStaffId)
    }
  })

  const getPoliciesByScope = (scope: CommissionScope) => {
    return filteredPolicies.filter(p => p.scope === scope)
  }

  const handleAddPolicy = (scope: CommissionScope) => {
    setEditingPolicy(null)
    setEditingScope(scope)
    setIsEditorOpen(true)
  }

  const handleEditPolicy = (policy: CommissionPolicy) => {
    setEditingPolicy(policy)
    setEditingScope(policy.scope)
    setIsEditorOpen(true)
  }

  const handleDeletePolicy = (id: string) => {
    if (confirm('Are you sure you want to delete this commission policy?')) {
      deleteCommissionPolicy(id)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingPolicy(null)
    setEditingScope(null)
  }

  const handleTutorialNext = () => {
    if (tutorialStep < 2) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
    }
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
  }

  const formatPolicyDisplay = (policy: CommissionPolicy) => {
    const typeLabel = policy.type === 'percent' ? `${policy.value}%` : `$${policy.value}`
    const appliesTo = policy.appliesTo === 'serviceProvider' ? 'Service Provider' : 'Seller'
    return `${typeLabel} - ${appliesTo}`
  }

  const scopes: CommissionScope[] = ['serviceCategory', 'service', 'product', 'giftCard', 'membership', 'package']

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Tutorial Popovers */}
      {showTutorial && (
        <Popover
          open={true}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 100, left: window.innerWidth / 2 }}
          onClose={handleTutorialSkip}
        >
          <Box sx={{ p: 3, maxWidth: 400 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {tutorialStep === 0 && 'Set Commission Rates'}
              {tutorialStep === 1 && 'Choose Scope'}
              {tutorialStep === 2 && 'Apply to Staff'}
            </Typography>
            <Typography variant="body2" paragraph>
              {tutorialStep === 0 && 'Create commission policies for different categories. Set percentage or fixed amounts for each type of sale.'}
              {tutorialStep === 1 && 'Commissions can apply to services, products, gift cards, memberships, or packages. Each category can have different rates.'}
              {tutorialStep === 2 && 'Apply policies globally to all staff, or create custom rates for specific team members.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleTutorialSkip}>
                Skip
              </Button>
              <Button size="small" variant="contained" onClick={handleTutorialNext}>
                {tutorialStep === 2 ? 'Got it' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Popover>
      )}

      {/* Header Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Commission Policies
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Staff Selector */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Apply to</InputLabel>
          <Select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            label="Apply to"
          >
            <MenuItem value="all">All Staff (Default)</MenuItem>
            {mockStaff.map((staff) => (
              <MenuItem key={staff.id} value={staff.id}>
                {staff.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Commissions Content */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          p: 2
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Default Commissions
        </Typography>

        {/* Commission Accordions */}
        {scopes.map((scope) => {
          const policies = getPoliciesByScope(scope)

          return (
            <Accordion
              key={scope}
              defaultExpanded={scope === 'serviceCategory'}
              sx={{ mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {SCOPE_LABELS[scope]}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${policies.length} ${policies.length === 1 ? 'policy' : 'policies'}`}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {policies.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 3,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      No commission policies for {SCOPE_LABELS[scope].toLowerCase()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<i className="ri-add-line" />}
                      onClick={() => handleAddPolicy(scope)}
                      sx={{ mt: 1 }}
                    >
                      Add Policy
                    </Button>
                  </Box>
                ) : (
                  <>
                    <List sx={{ py: 0 }}>
                      {policies.map((policy) => (
                        <ListItem
                          key={policy.id}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: 'background.paper'
                          }}
                        >
                          <ListItemText
                            primary={formatPolicyDisplay(policy)}
                            secondary={
                              policy.staffScope === 'all'
                                ? 'Applies to all staff'
                                : `Applies to ${policy.staffScope.staffIds.length} staff member${policy.staffScope.staffIds.length !== 1 ? 's' : ''}`
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleEditPolicy(policy)}
                              sx={{ mr: 1 }}
                            >
                              <i className="ri-edit-line" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              color="error"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <i className="ri-delete-bin-line" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<i className="ri-add-line" />}
                      onClick={() => handleAddPolicy(scope)}
                    >
                      Add Another Policy
                    </Button>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Paper>

      {/* Banner */}
      <Alert
        severity="success"
        icon={<i className="ri-trophy-line" />}
        sx={{ borderRadius: 2 }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Flexible Commissions
        </Typography>
        <Typography variant="caption">
          Set different commission rates for services, products, and sales. Track earnings by staff member
          and automatically calculate payouts.
        </Typography>
      </Alert>

      {/* Commission Editor Modal */}
      <CommissionEditorModal
        open={isEditorOpen}
        onClose={handleCloseEditor}
        policy={editingPolicy}
        scope={editingScope}
        selectedStaffId={selectedStaffId}
      />
    </Box>
  )
}
