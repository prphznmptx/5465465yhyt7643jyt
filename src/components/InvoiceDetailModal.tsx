import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  customer_id?: string;
  total: number;
  status: string;
  invoice_date: string;
  due_date: string;
  notes?: string;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onDelete: (invoiceId: string) => Promise<void>;
  onUpdate?: (invoiceId: string, data: Partial<Invoice>) => Promise<void>;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onDelete,
  onUpdate,
}: InvoiceDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleEdit = () => {
    setEditData({
      notes: invoice.notes,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData || !onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(invoice.invoice_id, editData);
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(invoice.invoice_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-white/10 w-full max-w-lg max-h-[600px] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Invoice' : 'Invoice Details'}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isEditing ? (
            <>
              <div>
                <label className="text-gray-400 text-sm">Invoice #</label>
                <p className="text-white font-medium">{invoice.invoice_number}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Customer</label>
                <p className="text-white font-medium">{invoice.customer_name}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Amount</label>
                <p className="text-white font-medium text-lg">
                  ${invoice.total.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Invoice Date</label>
                <p className="text-white">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Due Date</label>
                <p className="text-white">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <p className="text-white capitalize">{invoice.status}</p>
              </div>

              {invoice.notes && (
                <div>
                  <label className="text-gray-400 text-sm">Notes</label>
                  <p className="text-white">{invoice.notes}</p>
                </div>
              )}
            </>
          ) : editData ? (
            <>
              <div>
                <label className="text-gray-400 text-sm">Invoice #</label>
                <p className="text-white font-medium">{invoice.invoice_number}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Customer</label>
                <p className="text-white font-medium">{invoice.customer_name}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Amount</label>
                <p className="text-white font-medium text-lg">
                  ${invoice.total.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Notes</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  placeholder="Enter notes"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <p className="text-white capitalize">{invoice.status}</p>
              </div>
            </>
          ) : null}

          <div className="flex gap-3 pt-4 border-t border-white/10">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
