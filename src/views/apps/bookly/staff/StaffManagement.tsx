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
import Avatar from '@mui/material/Avatar'

// MUI Imports
import Chip from '@mui/material/Chip'

// API Imports
import { StaffService, BranchesService, ServicesService } from '@/lib/api'
import type { Staff, Branch, Service } from '@/lib/api'

// Component Imports
import CreateStaffDialog from './CreateStaffDialog'
import EditStaffDialog from './EditStaffDialog'
import { TableSkeleton } from '@/components/LoadingStates'
import { ErrorDisplay } from '@/components/ErrorComponents'

// Utils
import { extractErrorMessage, logError, withErrorHandling } from '@/utils/errorHandling'

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const fetchData = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      setError(null)

      const [staffResponse, branchesResponse, servicesResponse] = await Promise.all([
        StaffService.getStaff(),
        BranchesService.getBranches(),
        ServicesService.getServices()
      ])

      // Check if API calls succeeded, otherwise use fallback mock data
      if (staffResponse.error && branchesResponse.error && servicesResponse.error) {
        console.log('API unavailable, using mock data')

        // Mock branches data
        const mockBranches: Branch[] = [
          {
            id: '1',
            name: 'Downtown Branch',
            address: '123 Main Street, Downtown, City 12345',
            businessId: 'business1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Westside Branch',
            address: '456 Oak Avenue, Westside, City 67890',
            businessId: 'business1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        // Mock services data
        const mockServices: Service[] = [
          {
            id: 'service1',
            name: 'Hair Cut',
            description: 'Professional hair cutting service',
            location: 'Downtown',
            price: 50,
            duration: 60,
            businessId: 'business1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'service2',
            name: 'Hair Styling',
            description: 'Hair styling and blowdry',
            location: 'Downtown',
            price: 75,
            duration: 90,
            businessId: 'business1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'service3',
            name: 'Facial Treatment',
            description: 'Relaxing facial treatment',
            location: 'Westside',
            price: 100,
            duration: 120,
            businessId: 'business1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        // Mock staff data with branch assignments
        const mockStaff: Staff[] = [
          {
            id: 'staff1',
            name: 'Maria Rodriguez',
            mobile: '+1 (555) 111-1111',
            businessId: 'business1',
            branchId: '1',
            services: [mockServices[0], mockServices[1]], // Hair Cut & Hair Styling
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString()
          },
          {
            id: 'staff2',
            name: 'Carlos Mendez',
            mobile: '+1 (555) 222-2222',
            businessId: 'business1',
            branchId: '1',
            services: [mockServices[0]], // Hair Cut only
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString()
          },
          {
            id: 'staff3',
            name: 'Sofia Gonzalez',
            mobile: '+1 (555) 333-3333',
            businessId: 'business1',
            branchId: '2',
            services: [mockServices[2]], // Facial Treatment
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
          },
          {
            id: 'staff4',
            name: 'Ana Martinez',
            mobile: '+1 (555) 444-4444',
            businessId: 'business1',
            branchId: '1',
            services: [mockServices[1], mockServices[0]], // Hair Styling & Hair Cut
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString()
          },
          {
            id: 'staff5',
            name: 'Isabel Lopez',
            mobile: '+1 (555) 555-5555',
            businessId: 'business1',
            branchId: '2',
            services: [mockServices[2]], // Facial Treatment
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString()
          }
        ]

        setStaff(mockStaff)
        setBranches(mockBranches)
        setServices(mockServices)
      } else {
        // Use API data if available
        if (staffResponse.error) {
          throw new Error(staffResponse.error)
        }
        if (branchesResponse.error) {
          throw new Error(branchesResponse.error)
        }
        if (servicesResponse.error) {
          throw new Error(servicesResponse.error)
        }

        setStaff(staffResponse.data || [])
        setBranches(branchesResponse.data || [])
        setServices(servicesResponse.data || [])
      }
    }, 'Failed to fetch staff data').catch((err) => {
      logError(err, 'StaffManagement.fetchData')
      setError(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateStaff = async (staffData: any) => {
    await withErrorHandling(async () => {
      const response = await StaffService.createStaff({
        name: staffData.name,
        mobile: staffData.mobile,
        branchId: staffData.branchId,
        serviceIds: staffData.serviceIds,
        profilePhoto: staffData.profilePhoto
      })
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchData()
      setCreateDialogOpen(false)
    }, 'Failed to create staff member').catch((err) => {
      logError(err, 'StaffManagement.handleCreateStaff', { staffData })
      setError(err)
    })
  }

  const handleEditStaff = async (staffData: any) => {
    await withErrorHandling(async () => {
      const response = await StaffService.updateStaff({
        id: staffData.id,
        name: staffData.name,
        mobile: staffData.mobile,
        branchId: staffData.branchId,
        serviceIds: staffData.serviceIds,
        profilePhoto: staffData.profilePhoto
      })
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchData()
      setEditDialogOpen(false)
      setSelectedStaff(null)
    }, 'Failed to update staff member').catch((err) => {
      logError(err, 'StaffManagement.handleEditStaff', { staffData })
      setError(err)
    })
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    setActionLoading(`delete-${staffId}`)
    await withErrorHandling(async () => {
      const response = await StaffService.deleteStaff(staffId)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData()
    }, 'Failed to delete staff member').catch((err) => {
      logError(err, 'StaffManagement.handleDeleteStaff', { staffId })
      setError(err)
    }).finally(() => {
      setActionLoading(null)
    })
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TableSkeleton rows={5} columns={4} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Staff Management'
            subheader='Manage your business staff members'
            action={
              <Button
                variant='contained'
                onClick={() => setCreateDialogOpen(true)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Staff Member
              </Button>
            }
          />
          <CardContent>
            {error && (
              <ErrorDisplay
                error={error}
                onRetry={fetchData}
                context="Staff Management"
                showDetails={false}
              />
            )}

            {staff.length === 0 ? (
              <div className='text-center py-8'>
                <Typography variant='h6' color='textSecondary'>
                  No staff members found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Add your first staff member to get started
                </Typography>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Assigned Branches</TableCell>
                    <TableCell>Assigned Services</TableCell>
                    <TableCell>Member Since</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar>
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </Avatar>
                          <Typography variant='subtitle2'>{member.name}</Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.mobile || 'No mobile number'}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {member.branchId ? (
                            (() => {
                              const branch = branches.find(b => b.id === member.branchId)
                              return branch ? (
                                <Chip key={branch.id} label={branch.name} size='small' color='secondary' variant='outlined' />
                              ) : (
                                <Typography variant='body2' color='textSecondary'>
                                  Branch not found
                                </Typography>
                              )
                            })()
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No branch assigned
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {member.services && member.services.length > 0 ? (
                            member.services.map(service => (
                              <Chip key={service.id} label={service.name} size='small' color='primary' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              No services assigned
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedStaff(member)
                            setEditDialogOpen(true)
                          }}
                        >
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteStaff(member.id)}
                          disabled={actionLoading === `delete-${member.id}`}
                        >
                          {actionLoading === `delete-${member.id}` ? (
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

      {/* Create Staff Dialog */}
      <CreateStaffDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateStaff}
        branches={branches}
        services={services}
      />

      {/* Edit Staff Dialog */}
      {selectedStaff && (
        <EditStaffDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedStaff(null)
          }}
          onSubmit={handleEditStaff}
          staff={selectedStaff}
          branches={branches}
          services={services}
        />
      )}
    </Grid>
  )
}

export default StaffManagement