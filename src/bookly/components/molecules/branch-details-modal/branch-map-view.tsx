'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Branch } from '@/lib/api'

interface BranchMapViewProps {
  branch: Branch
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map center updates
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 15, {
      animate: true,
      duration: 1
    })
  }, [center, map])

  return null
}

const BranchMapView = ({ branch }: BranchMapViewProps) => {
  // Extract coordinates from branch or use default (Cairo coordinates as fallback)
  const latitude = (branch as any).latitude || 30.0444
  const longitude = (branch as any).longitude || 31.2357
  const center: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: '300px', width: '100%' }}
      className='z-0'
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ChangeMapView center={center} />
      <Marker position={center} icon={customIcon}>
        <Popup>
          <div className='text-center'>
            <h3 className='font-semibold text-gray-900'>{branch.name}</h3>
            <p className='text-sm text-gray-600 mt-1'>{branch.address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default BranchMapView
