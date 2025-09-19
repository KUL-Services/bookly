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
import { StaffService, BranchesService } from '@/lib/api'
import type { Staff, Branch } from '@/lib/api'

// Component Imports
import CreateStaffDialog from './CreateStaffDialog'
import EditStaffDialog from './EditStaffDialog'

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [staffResponse, branchesResponse] = await Promise.all([
        StaffService.getStaff(),
        BranchesService.getBranches()
      ])

      // Check if API calls succeeded, otherwise use fallback mock data
      if (staffResponse.error && branchesResponse.error) {
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

        // Mock staff data with branch assignments
        const mockStaff: Staff[] = [
          {
            id: 'staff1',
            name: 'Maria Rodriguez',
            mobile: '+1 (555) 111-1111',
            businessId: 'business1',
            branchId: '1',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString()
          },
          {
            id: 'staff2',
            name: 'Carlos Mendez',
            mobile: '+1 (555) 222-2222',
            businessId: 'business1',
            branchId: '1',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString()
          },
          {
            id: 'staff3',
            name: 'Sofia Gonzalez',
            mobile: '+1 (555) 333-3333',
            businessId: 'business1',
            branchId: '2',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
          },
          {
            id: 'staff4',
            name: 'Ana Martinez',
            mobile: '+1 (555) 444-4444',
            businessId: 'business1',
            branchId: '1',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString()
          },
          {
            id: 'staff5',
            name: 'Isabel Lopez',
            mobile: '+1 (555) 555-5555',
            businessId: 'business1',
            branchId: '2',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString()
          }
        ]

        setStaff(mockStaff)
        setBranches(mockBranches)
        setError(null)
      } else {
        // Use API data if available
        if (staffResponse.error) {
          throw new Error(staffResponse.error)
        }
        if (branchesResponse.error) {
          throw new Error(branchesResponse.error)
        }

        setStaff(staffResponse.data || [])
        setBranches(branchesResponse.data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateStaff = async (staffData: any) => {
    try {
      const response = await StaffService.createStaff({
        name: staffData.name,
        mobile: staffData.mobile,
        branchId: staffData.branchId
      })
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchData()
      setCreateDialogOpen(false)
    } catch (err) {
      console.error('Failed to create staff:', err)
    }
  }

  const handleEditStaff = async (staffData: any) => {
    try {
      const response = await StaffService.updateStaff({
        id: staffData.id,
        name: staffData.name,
        mobile: staffData.mobile,
        branchId: staffData.branchId
      })
      if (response.error) {
        throw new Error(response.error)
      }

      await fetchData()
      setEditDialogOpen(false)
      setSelectedStaff(null)
    } catch (err) {
      console.error('Failed to update staff:', err)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const response = await StaffService.deleteStaff(staffId)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchData() // Refresh the list
    } catch (err) {
      console.error('Failed to delete staff:', err)
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-center items-center py-12'>
              <CircularProgress />
            </CardContent>
          </Card>
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
              <Alert severity='error' className='mb-4'>
                {error}
              </Alert>
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
                        >
                          <i className='ri-delete-bin-line' />
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
        />
      )}
    </Grid>
  )
}

export default StaffManagement