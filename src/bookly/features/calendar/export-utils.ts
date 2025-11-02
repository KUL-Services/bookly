'use client'

import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import type { CalendarEvent } from './types'

export interface ExportOptions {
  filename?: string
  sheetName?: string
  includeFilters?: boolean
  filterInfo?: {
    view: string
    dateRange: string
    branches?: string[]
    staff?: string[]
    rooms?: string[]
  }
}

/**
 * Export calendar events to Excel file
 */
export function exportEventsToExcel(events: CalendarEvent[], options: ExportOptions = {}) {
  const {
    filename = `calendar-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`,
    sheetName = 'Calendar Events',
    includeFilters = true,
    filterInfo
  } = options

  // Prepare data for Excel
  const excelData = events.map(event => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const props = event.extendedProps

    return {
      'Date': format(start, 'yyyy-MM-dd'),
      'Start Time': format(start, 'HH:mm'),
      'End Time': format(end, 'HH:mm'),
      'Duration (min)': Math.round((end.getTime() - start.getTime()) / 1000 / 60),
      'Customer': props.customerName || event.title,
      'Service': props.serviceName || '',
      'Staff': props.staffName || '',
      'Room': props.roomId || '',
      'Status': props.status || '',
      'Payment Status': props.paymentStatus || '',
      'Price': props.price || '',
      'Notes': props.notes || '',
      'Selection Method': props.selectionMethod || '',
      'Starred': props.starred ? 'Yes' : 'No',
      'Booking ID': props.bookingId || ''
    }
  })

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Add filter info sheet if requested
  if (includeFilters && filterInfo) {
    const filterData = [
      ['Export Information'],
      [''],
      ['Generated At', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      ['View', filterInfo.view],
      ['Date Range', filterInfo.dateRange],
      ['Total Records', events.length],
      ['']
    ]

    if (filterInfo.branches && filterInfo.branches.length > 0) {
      filterData.push(['Branches', filterInfo.branches.join(', ')])
    }

    if (filterInfo.staff && filterInfo.staff.length > 0) {
      filterData.push(['Staff', filterInfo.staff.join(', ')])
    }

    if (filterInfo.rooms && filterInfo.rooms.length > 0) {
      filterData.push(['Rooms', filterInfo.rooms.join(', ')])
    }

    const filterSheet = XLSX.utils.aoa_to_sheet(filterData)

    // Set column widths for filter info
    filterSheet['!cols'] = [{ wch: 20 }, { wch: 50 }]

    XLSX.utils.book_append_sheet(workbook, filterSheet, 'Export Info')
  }

  // Add main data sheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },  // Date
    { wch: 10 },  // Start Time
    { wch: 10 },  // End Time
    { wch: 12 },  // Duration
    { wch: 20 },  // Customer
    { wch: 20 },  // Service
    { wch: 15 },  // Staff
    { wch: 12 },  // Room
    { wch: 12 },  // Status
    { wch: 15 },  // Payment Status
    { wch: 10 },  // Price
    { wch: 30 },  // Notes
    { wch: 15 },  // Selection Method
    { wch: 8 },   // Starred
    { wch: 20 }   // Booking ID
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate and download file
  XLSX.writeFile(workbook, filename)
}

/**
 * Export summary statistics to Excel
 */
export function exportSummaryToExcel(events: CalendarEvent[], options: ExportOptions = {}) {
  const {
    filename = `calendar-summary-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`,
  } = options

  // Calculate summary statistics
  const totalEvents = events.length
  const statusCounts: Record<string, number> = {}
  const serviceCounts: Record<string, number> = {}
  const staffCounts: Record<string, number> = {}
  const branchCounts: Record<string, number> = {}
  let totalRevenue = 0
  let paidRevenue = 0
  let unpaidRevenue = 0

  events.forEach(event => {
    const props = event.extendedProps

    // Count by status
    statusCounts[props.status] = (statusCounts[props.status] || 0) + 1

    // Count by service
    if (props.serviceName) {
      serviceCounts[props.serviceName] = (serviceCounts[props.serviceName] || 0) + 1
    }

    // Count by staff
    if (props.staffName) {
      staffCounts[props.staffName] = (staffCounts[props.staffName] || 0) + 1
    }

    // Count by room
    if (props.roomId) {
      branchCounts[props.roomId] = (branchCounts[props.roomId] || 0) + 1
    }

    // Revenue
    const price = typeof props.price === 'number' ? props.price : parseFloat(String(props.price)) || 0
    totalRevenue += price
    if (props.paymentStatus === 'paid') {
      paidRevenue += price
    } else {
      unpaidRevenue += price
    }
  })

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['Calendar Summary Report'],
    [''],
    ['Generated At', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    [''],
    ['Overall Statistics'],
    ['Total Appointments', totalEvents],
    ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
    ['Paid Revenue', `$${paidRevenue.toFixed(2)}`],
    ['Unpaid Revenue', `$${unpaidRevenue.toFixed(2)}`],
    [''],
    ['Appointments by Status'],
    ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
    [''],
    ['Appointments by Service'],
    ...Object.entries(serviceCounts).map(([service, count]) => [service, count]),
    [''],
    ['Appointments by Staff'],
    ...Object.entries(staffCounts).map(([staff, count]) => [staff, count]),
    [''],
    ['Appointments by Room'],
    ...Object.entries(branchCounts).map(([room, count]) => [room, count])
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Generate and download file
  XLSX.writeFile(workbook, filename)
}
