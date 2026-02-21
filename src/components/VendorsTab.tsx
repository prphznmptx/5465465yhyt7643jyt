import React from 'react';
import { Plus, Users, Mail, FileText, Trash2, Zap } from 'lucide-react';

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
}

export default function VendorsTab({ vendors, isLoading, onNewClick, onDelete }: VendorsTabProps) {
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
                <button
                  onClick={() => onDelete(vendor.contact_id)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Delete vendor"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {vendor.email && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {vendor.email}
                  </p>
                )}
                {vendor.phone && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {vendor.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
