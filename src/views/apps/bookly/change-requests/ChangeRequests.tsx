'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import { TableSkeleton } from '@/components/LoadingStates'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// API Imports
import { BusinessService } from '@/lib/api'

interface ChangeRequest {
  id: string
  businessId: string
  businessName: string
  requestType: 'profile_update' | 'info_change'
  status: 'pending' | 'approved' | 'rejected'
  requestedChanges: {
    field: string
    oldValue: string
    newValue: string
  }[]
  requestedBy: string
  requestedAt: string
  reason?: string
}

const ChangeRequests = () => {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  const fetchChangeRequests = async () => {
    try {
      setLoading(true)
      // Using mock data for now since API endpoint may not be implemented yet
      const mockChangeRequests: ChangeRequest[] = [
        {
          id: '1',
          businessId: 'business_1',
          businessName: 'Bella Vista Salon',
          requestType: 'profile_update',
          status: 'pending',
          requestedChanges: [
            {
              field: 'description',
              oldValue: 'Premium beauty salon offering hair, nails, and spa services',
              newValue: 'Premium beauty salon offering hair, nails, spa services, and massage therapy'
            },
            {
              field: 'email',
              oldValue: 'admin@bellavista.com',
              newValue: 'contact@bellavistasalon.com'
            }
          ],
          requestedBy: 'Maria Rodriguez',
          requestedAt: new Date('2024-01-22').toISOString(),
          reason: 'Updated business services and contact information'
        },
        {
          id: '2',
          businessId: 'business_2',
          businessName: 'TechFix Repair Center',
          requestType: 'info_change',
          status: 'pending',
          requestedChanges: [
            {
              field: 'name',
              oldValue: 'TechFix Repair Center',
              newValue: 'TechFix Pro Repair Center'
            }
          ],
          requestedBy: 'John Smith',
          requestedAt: new Date('2024-01-24').toISOString(),
          reason: 'Rebranding to TechFix Pro'
        }
      ]

      setChangeRequests(mockChangeRequests)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch change requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChangeRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }))

    try {
      // Mock approval - replace with actual API call
      console.log('Approving change request:', requestId)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remove from pending list
      setChangeRequests(prev => prev.filter(request => request.id !== requestId))
    } catch (err) {
      console.error('Failed to approve change request:', err)
      setError('Failed to approve change request')
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleReject = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this change request?')) {
      return
    }

    setActionLoading(prev => ({ ...prev, [requestId]: true }))

    try {
      // Mock rejection - replace with actual API call
      console.log('Rejecting change request:', requestId)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remove from pending list
      setChangeRequests(prev => prev.filter(request => request.id !== requestId))
    } catch (err) {
      console.error('Failed to reject change request:', err)
      setError('Failed to reject change request')
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const getRequestTypeLabel = (type: ChangeRequest['requestType']) => {
    switch (type) {
      case 'profile_update':
        return 'Profile Update'
      case 'info_change':
        return 'Information Change'
      default:
        return type
    }
  }

  const getRequestTypeColor = (type: ChangeRequest['requestType']) => {
    switch (type) {
      case 'profile_update':
        return 'info'
      case 'info_change':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={3} columns={6} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Pending Change Requests' subheader='Review and approve business profile change requests' />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {changeRequests.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No pending change requests
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  All change requests have been processed
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Request Type</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Request Date</TableCell>
                    <TableCell>Changes</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changeRequests.map(request => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{request.businessName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRequestTypeLabel(request.requestType)}
                          color={getRequestTypeColor(request.requestType) as any}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{request.requestedBy}</Typography>
                      </TableCell>
                      <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Accordion>
                          <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                            <Typography variant='body2'>{request.requestedChanges.length} change(s)</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <div className='space-y-3'>
                              {request.reason && (
                                <div>
                                  <Typography variant='subtitle2' color='primary'>
                                    Reason:
                                  </Typography>
                                  <Typography variant='body2'>{request.reason}</Typography>
                                </div>
                              )}
                              {request.requestedChanges.map((change, index) => (
                                <div key={index} className='border-l-2 border-gray-200 pl-3'>
                                  <Typography variant='subtitle2' className='capitalize'>
                                    {change.field}:
                                  </Typography>
                                  <Typography variant='body2' color='textSecondary'>
                                    <strong>From:</strong> {change.oldValue}
                                  </Typography>
                                  <Typography variant='body2' color='primary'>
                                    <strong>To:</strong> {change.newValue}
                                  </Typography>
                                </div>
                              ))}
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                      <TableCell align='center'>
                        <Box className='flex gap-2 justify-center'>
                          <Button
                            size='small'
                            variant='contained'
                            color='success'
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading[request.id]}
                            startIcon={actionLoading[request.id] ? <BrandedSpinner size={16} color='inherit' /> : null}
                          >
                            {actionLoading[request.id] ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading[request.id]}
                            startIcon={actionLoading[request.id] ? <BrandedSpinner size={16} color='inherit' /> : null}
                          >
                            {actionLoading[request.id] ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ChangeRequests
