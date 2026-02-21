import React from 'react';

interface Expense {
  expense_id: string;
  vendor_name: string;
  vendor_id?: string;
  amount: number;
  status: string;
  expense_date: string;
  reference_number?: string;
  customer_name?: string;
  paid_through?: string;
  account_name?: string;
  account_id?: string;
  currency?: string;
}

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  currencyDefault: string;
  onDelete: (expenseId: string) => Promise<void>;
}

export default function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  currencyDefault,
  onDelete,
}: ExpenseDetailModalProps) {
  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    await onDelete(expense.expense_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-white/10 w-full max-w-lg max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-800">
          <h3 className="text-xl font-bold text-white">Expense Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm">Vendor</label>
            <p className="text-white font-medium">{expense.vendor_name}</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Amount</label>
            <p className="text-white font-medium text-lg">
              {expense.currency || currencyDefault} {expense.amount.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Reference #</label>
            <p className="text-white">{expense.reference_number || 'N/A'}</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Account</label>
            <p className="text-white">{expense.account_name || 'N/A'}</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Expense Date</label>
            <p className="text-white">{new Date(expense.expense_date).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Status</label>
            <p className="text-white capitalize">{expense.status}</p>
          </div>

          {expense.customer_name && (
            <div>
              <label className="text-gray-400 text-sm">Customer</label>
              <p className="text-white">{expense.customer_name}</p>
            </div>
          )}

          {expense.paid_through && (
            <div>
              <label className="text-gray-400 text-sm">Paid Through</label>
              <p className="text-white">{expense.paid_through}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-white/10">
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
          </div>
        </div>
      </div>
    </div>
  );
}
