import { useState } from 'react'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Button } from '@/bookly/components/molecules'
import { KulIcon } from '@/bookly/components/atoms'
import type { Branch, Service, Staff } from '@/lib/api'

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branch: Branch
  businessName: string
  businessImage?: string
  services?: Service[]
  staff?: Staff[]
  allBranches?: Branch[]
  onBranchChange?: (branch: Branch) => void
  onBookService?: (serviceId: string) => void
}

export const BranchDetailsModal = ({
  isOpen,
  onClose,
  branch,
  businessName,
  businessImage,
  services = [],
  staff = [],
  allBranches = [],
  onBranchChange,
  onBookService
}: BranchDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'staff'>('overview')

  if (!isOpen) return null

  const branchServices = services.filter(service =>
    !service.branches ||
    service.branches.length === 0 ||
    service.branches.some(serviceBranch => serviceBranch.id === branch.id)
  )

  const branchStaff = staff.filter(member =>
    member.branchId === branch.id
  )

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="relative">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                <KulIcon icon="lucide:x" className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <BusinessAvatar
                  businessName={businessName}
                  imageSrc={businessImage}
                  className="w-16 h-16 rounded-lg border-2 border-white"
                  size="xl"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold">{branch.name}</h2>
                    {allBranches.length > 1 && (
                      <select
                        value={branch.id}
                        onChange={(e) => {
                          const selectedBranch = allBranches.find(b => b.id === e.target.value)
                          if (selectedBranch && onBranchChange) {
                            onBranchChange(selectedBranch)
                          }
                        }}
                        className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-md px-3 py-1 text-sm"
                      >
                        {allBranches.map(b => (
                          <option key={b.id} value={b.id} className="text-gray-900">
                            {b.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <p className="text-white text-opacity-90 mb-2">{businessName}</p>
                  <div className="flex items-center gap-2 text-white text-opacity-80">
                    <KulIcon icon="lucide:map-pin" className="w-4 h-4" />
                    <span className="text-sm">{branch.address}</span>
                  </div>
                  {branch.mobile && (
                    <div className="flex items-center gap-2 text-white text-opacity-80 mt-1">
                      <KulIcon icon="lucide:phone" className="w-4 h-4" />
                      <span className="text-sm">{branch.mobile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b bg-gray-50">
              <div className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: 'lucide:info' },
                  { id: 'services', label: 'Services', icon: 'lucide:scissors' },
                  { id: 'staff', label: 'Staff', icon: 'lucide:users' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-teal-600 border-teal-600 bg-white'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <KulIcon icon={tab.icon} className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">{branch.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm"
                    >
                      <KulIcon icon="lucide:external-link" className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                </div>

                {/* Contact */}
                {branch.mobile && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <KulIcon icon="lucide:phone" className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${branch.mobile}`} className="text-teal-600 hover:text-teal-700">
                          {branch.mobile}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Info</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{branchServices.length}</div>
                      <div className="text-sm text-blue-600">Services</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{branchStaff.length}</div>
                      <div className="text-sm text-green-600">Staff Members</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">4.8</div>
                      <div className="text-sm text-purple-600">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h3>
                {branchServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <KulIcon icon="lucide:scissors" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No services available at this branch</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {branchServices.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-200 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <KulIcon icon="lucide:clock" className="w-4 h-4" />
                              {service.duration} min
                            </span>
                            <span className="font-medium text-teal-600">£{service.price}</span>
                          </div>
                        </div>
                        <Button
                          buttonText={{ plainText: 'Book Now' }}
                          variant="contained"
                          className="bg-teal-500 hover:bg-teal-600 text-white"
                          onClick={() => onBookService?.(service.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Team</h3>
                {branchStaff.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <KulIcon icon="lucide:users" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No staff assigned to this branch</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {branchStaff.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                        <BusinessAvatar
                          businessName={member.name}
                          className="w-12 h-12 rounded-full"
                          size="md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          {member.mobile && (
                            <p className="text-sm text-gray-600">{member.mobile}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}