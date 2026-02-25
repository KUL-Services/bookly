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
import { TableSkeleton } from '@/components/LoadingStates'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// API Imports
import { BusinessService } from '@/lib/api'
import type { Business } from '@/lib/api'

const BusinessApprovals = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true)
      const response = await BusinessService.getPendingBusinesses()
      if (response.error) {
        throw new Error(response.error)
      }
      setPendingBusinesses(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending businesses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingBusinesses()
  }, [])

  const handleApprove = async (businessId: string) => {
    setActionLoading(prev => ({ ...prev, [businessId]: true }))

    try {
      const response = await BusinessService.approveBusiness({ id: businessId })
      if (response.error) {
        throw new Error(response.error)
      }

      // Remove from pending list
      setPendingBusinesses(prev => prev.filter(business => business.id !== businessId))
    } catch (err) {
      console.error('Failed to approve business:', err)
      setError('Failed to approve business')
    } finally {
      setActionLoading(prev => ({ ...prev, [businessId]: false }))
    }
  }

  const handleReject = async (businessId: string) => {
    if (!confirm('Are you sure you want to reject this business application?')) {
      return
    }

    setActionLoading(prev => ({ ...prev, [businessId]: true }))

    try {
      const response = await BusinessService.rejectBusiness({ id: businessId })
      if (response.error) {
        throw new Error(response.error)
      }

      // Remove from pending list
      setPendingBusinesses(prev => prev.filter(business => business.id !== businessId))
    } catch (err) {
      console.error('Failed to reject business:', err)
      setError('Failed to reject business')
    } finally {
      setActionLoading(prev => ({ ...prev, [businessId]: false }))
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={5} columns={6} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Pending Business Approvals' subheader='Review and approve new business registrations' />
          <CardContent>
            {error && (
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
            )}

            {pendingBusinesses.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No pending approvals
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  All business applications have been processed
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Social Links</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingBusinesses.map(business => (
                    <TableRow key={business.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{business.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Typography variant='body2'>{business.owner?.name || 'N/A'}</Typography>
                          <Typography variant='caption' color='textSecondary'>
                            {business.owner?.email || 'N/A'}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>{business.email || 'No business email'}</TableCell>
                      <TableCell>
                        <Typography variant='body2' className='max-w-xs'>
                          {business.description || 'No description provided'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {business.socialLinks?.length ? (
                            business.socialLinks.map((link, index) => (
                              <Chip
                                key={index}
                                label={link.platform}
                                size='small'
                                variant='outlined'
                                onClick={() => window.open(link.url, '_blank')}
                                className='cursor-pointer'
                              />
                            ))
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No social links
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align='center'>
                        <Box className='flex gap-2 justify-center'>
                          <Button
                            size='small'
                            variant='contained'
                            color='success'
                            onClick={() => handleApprove(business.id)}
                            disabled={actionLoading[business.id]}
                          >
                            {actionLoading[business.id] ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            onClick={() => handleReject(business.id)}
                            disabled={actionLoading[business.id]}
                          >
                            {actionLoading[business.id] ? 'Rejecting...' : 'Reject'}
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

export default BusinessApprovals
