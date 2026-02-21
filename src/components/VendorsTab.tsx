import React, { useState } from 'react';
import { Plus, Users, Mail, Phone, Trash2, Zap, Eye, Edit2 } from 'lucide-react';

interface Vendor {
  contact_id: string;
  contact_name: string;
  email: string;
  company_name?: string;
  phone?: string;
}

interface VendorsTabProps {
  vendors: Vendor[];
  isLoading: boolean;
  onNewClick: () => void;
  onDelete: (vendorId: string) => Promise<void>;
  onView?: (vendor: Vendor) => void;
  onEdit?: (vendor: Vendor) => void;
}

export default function VendorsTab({ vendors, isLoading, onNewClick, onDelete, onView, onEdit }: VendorsTabProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  return (
    <div className="space-y-6">
      <button
        onClick={onNewClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-semibold"
      >
        <Plus className="w-4 h-4" />
        New Vendor
      </button>

      {isLoading ? (
        <div className="text-center py-12">
          <Zap className="w-8 h-8 text-rose-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white/5 rounded-lg border border-white/10 p-12 text-center">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.contact_id} className="bg-white/5 rounded-lg border border-white/10 p-6 hover:border-rose-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{vendor.contact_name}</h4>
                  {vendor.company_name && <p className="text-sm text-gray-400">{vendor.company_name}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowDetailModal(true);
                      onView?.(vendor);
                    }}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="View vendor"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onEdit?.(vendor)}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Edit vendor"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDelete(vendor.contact_id)}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Delete vendor"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {vendor.email && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {vendor.email}
                  </p>
                )}
                {vendor.phone && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {vendor.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Detail Modal */}
      {showDetailModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-white/10 w-full max-w-lg">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Vendor Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedVendor(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-white font-medium">{selectedVendor.contact_name}</p>
              </div>
              {selectedVendor.company_name && (
                <div>
                  <label className="text-gray-400 text-sm">Company</label>
                  <p className="text-white">{selectedVendor.company_name}</p>
                </div>
              )}
              {selectedVendor.email && (
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white">{selectedVendor.email}</p>
                </div>
              )}
              {selectedVendor.phone && (
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white">{selectedVendor.phone}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedVendor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
