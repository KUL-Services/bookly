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

// API Imports
import { StaffService } from '@/lib/api'
import type { Staff } from '@/lib/api'

// Component Imports
import CreateStaffDialog from './CreateStaffDialog'
import EditStaffDialog from './EditStaffDialog'

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await StaffService.getStaff()

      if (response.error) {
        throw new Error(response.error)
      }

      setStaff(response.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleCreateStaff = async (staffData: any) => {
    try {
      const response = await StaffService.createStaff(staffData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchStaff() // Refresh the list
      setCreateDialogOpen(false)
    } catch (err) {
      console.error('Failed to create staff:', err)
    }
  }

  const handleEditStaff = async (staffData: any) => {
    try {
      const response = await StaffService.updateStaff(staffData)
      if (response.error) {
        throw new Error(response.error)
      }
      await fetchStaff() // Refresh the list
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
      await fetchStaff() // Refresh the list
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
        />
      )}
    </Grid>
  )
}

export default StaffManagement