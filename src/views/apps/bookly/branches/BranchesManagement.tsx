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
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

// API Imports
import { BranchesService, ServicesService } from '@/lib/api'
import type { Branch, Service } from '@/lib/api'

// Component Imports
import CreateBranchDialog from './CreateBranchDialog'
import EditBranchDialog from './EditBranchDialog'
import { TableSkeleton } from '@/components/LoadingStates'
import { ErrorDisplay } from '@/components/ErrorComponents'

// Utils
import { extractErrorMessage, logError, withErrorHandling } from '@/utils/errorHandling'

const BranchesManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  const fetchData = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const [branchesResponse, servicesResponse] = await Promise.all([
        BranchesService.getBranches(),
        ServicesService.getServices()
      ])

      // Check if API calls succeeded, otherwise use fallback mock data
      if (branchesResponse.error && servicesResponse.error) {
        console.log('API unavailable, using mock data')

        // Mock data for branches with staff
        const mockBranches: Branch[] = [
          {
            id: '1',
            name: 'Downtown Branch',
            address: '123 Main Street, Downtown, City 12345',
            mobile: '+1 (555) 123-4567',
            businessId: 'business1',
            services: [
              { id: '1', name: 'Hair Cut', price: 30, duration: 45, location: 'Downtown Branch', businessId: 'business1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: '2', name: 'Hair Color', price: 80, duration: 120, location: 'Downtown Branch', businessId: 'business1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            ],
            staff: [
              { id: 'staff1', name: 'Maria Rodriguez', mobile: '+1 (555) 111-1111', businessId: 'business1', branchIds: ['1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 'staff2', name: 'Carlos Mendez', mobile: '+1 (555) 222-2222', businessId: 'business1', branchIds: ['1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            ],
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
          },
          {
            id: '2',
            name: 'Westside Branch',
            address: '456 Oak Avenue, Westside, City 67890',
            mobile: '+1 (555) 987-6543',
            businessId: 'business1',
            services: [
              { id: '3', name: 'Manicure', price: 25, duration: 30, location: 'Westside Branch', businessId: 'business1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: '4', name: 'Pedicure', price: 35, duration: 45, location: 'Westside Branch', businessId: 'business1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            ],
            staff: [
              { id: 'staff3', name: 'Sofia Gonzalez', mobile: '+1 (555) 333-3333', businessId: 'business1', branchIds: ['2'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 'staff4', name: 'Ana Martinez', mobile: '+1 (555) 444-4444', businessId: 'business1', branchIds: ['2'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 'staff5', name: 'Isabel Lopez', mobile: '+1 (555) 555-5555', businessId: 'business1', branchIds: ['2'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            ],
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString()
          }
        ]

        // Mock data for services
        const mockServices: Service[] = [
          { id: '1', name: 'Hair Cut', price: 30, duration: 45 },
          { id: '2', name: 'Hair Color', price: 80, duration: 120 },
          { id: '3', name: 'Manicure', price: 25, duration: 30 },
          { id: '4', name: 'Pedicure', price: 35, duration: 45 },
          { id: '5', name: 'Facial Treatment', price: 60, duration: 60 },
          { id: '6', name: 'Massage Therapy', price: 90, duration: 90 }
        ]

        setBranches(mockBranches)
        setServices(mockServices)
      } else {
        // Use API data if available
        if (branchesResponse.error) {
          throw new Error(branchesResponse.error)
        }
        if (servicesResponse.error) {
          throw new Error(servicesResponse.error)
        }

        setBranches(branchesResponse.data || [])
        setServices(servicesResponse.data || [])
      }
    }, 'Failed to fetch branches data').catch((err) => {
      logError(err, 'BranchesManagement.fetchData')
      setError(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateBranch = async (branchData: any) => {
    await withErrorHandling(async () => {
      const response = await BranchesService.createBranch(branchData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setCreateDialogOpen(false)
      setSuccess('Branch created successfully!')
    }, 'Failed to create branch').catch((err) => {
      logError(err, 'BranchesManagement.handleCreateBranch', { branchData })
      setError(err)
    })
  }

  const handleEditBranch = async (branchData: any) => {
    await withErrorHandling(async () => {
      const response = await BranchesService.updateBranch(branchData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setEditDialogOpen(false)
      setSelectedBranch(null)
      setSuccess('Branch updated successfully!')
    }, 'Failed to update branch').catch((err) => {
      logError(err, 'BranchesManagement.handleEditBranch', { branchData })
      setError(err)
    })
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) {
      return
    }

    setActionLoading(`delete-${branchId}`)
    await withErrorHandling(async () => {
      const response = await BranchesService.deleteBranch(branchId)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
      setSuccess('Branch deleted successfully!')
    }, 'Failed to delete branch').catch((err) => {
      logError(err, 'BranchesManagement.handleDeleteBranch', { branchId })
      setError(err)
    }).finally(() => {
      setActionLoading(null)
    })
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={4} columns={4} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Branches Management'
            subheader='Manage your business locations'
            action={
              <Button
                variant='contained'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Branch
              </Button>
            }
          />
          <CardContent>
            {error && (
              <ErrorDisplay
                error={error}
                onRetry={fetchData}
                context="Branches Management"
                showDetails={false}
              />
            )}

            {success && (
              <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {branches.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No branches found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Create your first branch location to get started
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Branch Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Gallery</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Staff</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id} hover>
                      <TableCell>
                        <Typography variant='subtitle2'>{branch.name}</Typography>
                      </TableCell>
                      <TableCell>
                        {branch.address || 'No address provided'}
                      </TableCell>
                      <TableCell>
                        {branch.mobile || 'No mobile number'}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {branch.galleryUrls?.length ? (
                            <div className='flex gap-1 max-w-[200px] overflow-x-auto'>
                              {branch.galleryUrls.slice(0, 3).map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Branch ${branch.name} - Image ${index + 1}`}
                                  className='w-12 h-12 object-cover rounded-md border'
                                />
                              ))}
                              {branch.galleryUrls.length > 3 && (
                                <div className='w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-600'>
                                  +{branch.galleryUrls.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No images
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {branch.services?.length ? (
                            branch.services.map((service) => (
                              <Chip key={service.id} label={service.name} size='small' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No services
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {branch.staff?.length ? (
                            branch.staff.map((staff) => (
                              <Chip key={staff.id} label={staff.name} size='small' color='primary' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No staff assigned
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(branch.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedBranch(branch)
                            setEditDialogOpen(true)
                          }}
                        >
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteBranch(branch.id)}
                          disabled={actionLoading === `delete-${branch.id}`}
                        >
                          {actionLoading === `delete-${branch.id}` ? (
                            <CircularProgress size={16} />
                          ) : (
                            <i className='ri-delete-bin-line' />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Create Branch Dialog */}
      <CreateBranchDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateBranch}
        services={services}
      />

      {/* Edit Branch Dialog */}
      {selectedBranch && (
        <EditBranchDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedBranch(null)
          }}
          onSubmit={handleEditBranch}
          branch={selectedBranch}
          services={services}
        />
      )}
    </Grid>
  )
}

export default BranchesManagement