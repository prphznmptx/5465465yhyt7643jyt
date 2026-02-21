import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './useToast';
import {
  getInvoices,
  getCustomers,
  getExpenses,
  getProfitAndLoss,
  getVendors,
  createInvoice,
  createCustomer,
  createExpense,
  createVendor,
  getExpense,
  updateExpense,
  deleteExpense,
  deleteCustomer,
  deleteVendor,
  getExpenseAccounts,
} from '../lib/zohoBooksService';

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  total: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

interface Customer {
  contact_id: string;
  contact_name: string;
  email: string;
  company_name?: string;
  phone?: string;
}

interface Vendor {
  contact_id: string;
  contact_name: string;
  email: string;
  company_name?: string;
  phone?: string;
}

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

export function useBooksDataManagement(organizationId: string | null, isConnected: boolean) {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<Array<{ account_id: string; account_name: string; account_type: string }>>([]);
  const [reports, setReports] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Loading states
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  // Data loading functions
  const loadInvoicesData = async () => {
    if (!user?.id || !organizationId) return;
    setLoadingInvoices(true);
    try {
      const data = await getInvoices(user.id, organizationId);
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      addToast('Failed to load invoices', 'error');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const loadCustomersData = async () => {
    if (!user?.id || !organizationId) return;
    setLoadingCustomers(true);
    try {
      const data = await getCustomers(user.id, organizationId);
      setCustomers(data.contacts || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      addToast('Failed to load customers', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadVendorsData = async () => {
    if (!user?.id || !organizationId) return;
    setLoadingVendors(true);
    try {
      const data = await getVendors(user.id, organizationId);
      setVendors(data.contacts || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      addToast('Failed to load vendors', 'error');
    } finally {
      setLoadingVendors(false);
    }
  };

  const loadExpensesData = async () => {
    if (!user?.id || !organizationId) return;
    setLoadingExpenses(true);
    try {
      const data = await getExpenses(user.id, organizationId);
      const expensesList = data.expenses || [];
      console.log('📊 Loaded expenses:', {
        count: expensesList.length,
        firstExpense: expensesList[0],
        allFieldsPresent: expensesList.map(e => ({
          hasExpenseId: !!e.expense_id,
          hasVendorName: !!e.vendor_name,
          hasAmount: typeof e.amount === 'number',
          hasStatus: !!e.status,
          hasExpenseDate: !!e.expense_date,
        }))
      });
      setExpenses(expensesList);
    } catch (error) {
      console.error('Error loading expenses:', error);
      addToast('Failed to load expenses', 'error');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const loadReportsData = async () => {
    if (!user?.id || !organizationId) return;
    setLoadingReports(true);
    try {
      const data = await getProfitAndLoss(user.id, organizationId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      addToast('Failed to load reports', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  const loadExpenseAccountsData = async () => {
    if (!user?.id || !organizationId) return;
    try {
      const data = await getExpenseAccounts(user.id, organizationId);
      setExpenseAccounts(data || []);
    } catch (error) {
      console.error('Error loading expense accounts:', error);
      addToast('Failed to load expense accounts', 'error');
    }
  };

  const loadDashboardData = async () => {
    if (!user?.id || !organizationId) return;
    try {
      const [invoicesData, customersData, vendorsData, expensesData] = await Promise.all([
        getInvoices(user.id, organizationId, { limit: 5 }),
        getCustomers(user.id, organizationId, { limit: 5 }),
        getVendors(user.id, organizationId, { limit: 5 }),
        getExpenses(user.id, organizationId, { limit: 5 }),
      ]);
      setInvoices(invoicesData.invoices || []);
      setCustomers(customersData.contacts || []);
      setVendors(vendorsData.contacts || []);
      setExpenses(expensesData.expenses || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  // CRUD operations
  const handleCreateInvoice = async (
    invoiceForm: any,
    onSuccess?: () => void
  ) => {
    if (!user?.id || !organizationId) {
      addToast('User or organization not found', 'error');
      return false;
    }

    if (!invoiceForm.customer_id) {
      addToast('Please select a customer', 'error');
      return false;
    }

    if (!invoiceForm.description) {
      addToast('Please enter an item description', 'error');
      return false;
    }

    if (invoiceForm.quantity <= 0) {
      addToast('Quantity must be greater than 0', 'error');
      return false;
    }

    if (invoiceForm.rate <= 0) {
      addToast('Rate must be greater than 0', 'error');
      return false;
    }

    try {
      console.log('Creating invoice with data:', {
        customer_id: invoiceForm.customer_id,
        invoice_date: invoiceForm.invoice_date,
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes,
        line_items: [
          {
            item_id: '1',
            description: invoiceForm.description,
            quantity: invoiceForm.quantity,
            rate: invoiceForm.rate,
          },
        ],
      });

      const result = await createInvoice(user.id, organizationId, {
        customer_id: invoiceForm.customer_id,
        invoice_date: invoiceForm.invoice_date,
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes,
        line_items: [
          {
            description: invoiceForm.description,
            quantity: invoiceForm.quantity,
            rate: invoiceForm.rate,
          },
        ],
      });

      console.log('Invoice creation result:', result);
      addToast('Invoice created successfully!', 'success');
      await loadInvoicesData();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('🔴 Error creating invoice:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create invoice';
      console.error('Error details:', { errorMsg, fullError: error });
      addToast(errorMsg, 'error');
      return false;
    }
  };

  const handleCreateCustomer = async (
    customerForm: any,
    onSuccess?: () => void
  ) => {
    if (!user?.id || !organizationId) {
      console.error('❌ User or organization missing:', { userId: user?.id, orgId: organizationId });
      addToast('User or organization not found', 'error');
      return false;
    }

    if (!customerForm.contact_name) {
      console.error('❌ Customer name is empty');
      addToast('Customer name is required', 'error');
      return false;
    }

    console.log('📝 Calling createCustomer API with data:', {
      contact_name: customerForm.contact_name,
      email: customerForm.email || undefined,
      phone: customerForm.phone || undefined,
      company_name: customerForm.company_name || undefined,
    });

    try {
      console.log('Creating customer with data:', {
        contact_name: customerForm.contact_name,
        email: customerForm.email || undefined,
        phone: customerForm.phone || undefined,
        company_name: customerForm.company_name || undefined,
      });

      console.log('✅ About to call createCustomer...');

      const result = await createCustomer(user.id, organizationId, {
        contact_name: customerForm.contact_name,
        email: customerForm.email || undefined,
        phone: customerForm.phone || undefined,
        company_name: customerForm.company_name || undefined,
      });

      console.log('✅ Customer created! Result:', result);
      addToast('Customer created successfully!', 'success');
      console.log('📚 Loading customers data...');
      await loadCustomersData();
      console.log('✅ Customers loaded!');
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('🔴 Error creating customer:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create customer';
      console.error('Error details:', {
        errorMsg,
        fullError: error,
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      addToast(errorMsg, 'error');
      return false;
    }
  };

  const handleCreateVendor = async (
    vendorForm: any,
    onSuccess?: () => void
  ) => {
    if (!user?.id || !organizationId) {
      console.error('❌ User or organization missing:', { userId: user?.id, orgId: organizationId });
      addToast('User or organization not found', 'error');
      return false;
    }

    if (!vendorForm.contact_name) {
      console.error('❌ Vendor name is empty');
      addToast('Vendor name is required', 'error');
      return false;
    }

    console.log('📝 Calling createVendor API with data:', {
      contact_name: vendorForm.contact_name,
      email: vendorForm.email || undefined,
      phone: vendorForm.phone || undefined,
      company_name: vendorForm.company_name || undefined,
    });

    try {
      const result = await createVendor(user.id, organizationId, {
        contact_name: vendorForm.contact_name,
        email: vendorForm.email || undefined,
        phone: vendorForm.phone || undefined,
        company_name: vendorForm.company_name || undefined,
      });

      console.log('✅ Vendor created! Result:', result);
      addToast('Vendor created successfully!', 'success');
      console.log('📚 Loading vendors data...');
      await loadVendorsData();
      console.log('✅ Vendors loaded!');
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('🔴 Error creating vendor:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create vendor';
      console.error('Error details:', {
        errorMsg,
        fullError: error,
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      addToast(errorMsg, 'error');
      return false;
    }
  };

  const handleCreateExpense = async (
    expenseForm: any,
    onSuccess?: () => void
  ) => {
    if (!user?.id || !organizationId) {
      addToast('User or organization not found', 'error');
      return false;
    }

    if (!expenseForm.vendor_id) {
      addToast('Please select a vendor', 'error');
      return false;
    }

    if (!expenseForm.account_id) {
      addToast('Please select an expense account', 'error');
      return false;
    }

    if (expenseForm.amount <= 0) {
      addToast('Amount must be greater than 0', 'error');
      return false;
    }

    try {
      const selectedVendor = vendors.find(v => v.contact_id === expenseForm.vendor_id);
      const vendorName = selectedVendor?.contact_name || 'Vendor';

      const expenseData = {
        vendor_id: expenseForm.vendor_id,
        vendor_name: vendorName,
        account_id: expenseForm.account_id,
        expense_date: expenseForm.expense_date,
        total: expenseForm.amount,
        reference_number: expenseForm.reference_number || undefined,
        notes: expenseForm.notes || undefined,
      };

      console.log('🔵 Creating expense with data:', expenseData);

      const result = await createExpense(user.id, organizationId, expenseData);

      console.log('✅ Expense creation result:', result);
      addToast('Expense created successfully!', 'success');
      await loadExpensesData();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('🔴 Error creating expense:', error);
      let errorMsg = 'Failed to create expense';

      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.message) {
            errorMsg = `Zoho Books Error: ${parsedError.message}`;
            if (parsedError.code) {
              errorMsg += ` (Code: ${parsedError.code})`;
            }
          } else {
            errorMsg = error.message;
          }
        } catch (e) {
          errorMsg = error.message;
        }
      }

      console.error('Error details:', { errorMsg, fullError: error });
      addToast(errorMsg, 'error');
      return false;
    }
  };

  const handleViewExpense = async (expenseId: string, currency: string) => {
    if (!user?.id || !organizationId) return;
    try {
      const expense = await getExpense(user.id, organizationId, expenseId);
      const expenseData = expense?.expense || expense;
      if (expenseData) {
        setSelectedExpense({
          expense_id: expenseData.expense_id || expenseId,
          vendor_name: expenseData.vendor_name || '',
          vendor_id: expenseData.vendor_id,
          amount: expenseData.amount || 0,
          status: expenseData.status || '',
          expense_date: expenseData.expense_date || '',
          reference_number: expenseData.reference_number,
          customer_name: expenseData.customer_name,
          paid_through: expenseData.paid_through,
          account_name: expenseData.account?.account_name || '',
          account_id: expenseData.account_id,
          currency: expenseData.currency_code || currency,
        });
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      addToast('Failed to load expense details', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user?.id || !organizationId) return;
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteExpense(user.id, organizationId, expenseId);
      addToast('Expense deleted successfully!', 'success');
      setSelectedExpense(null);
      await loadExpensesData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      addToast('Failed to delete expense', 'error');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!user?.id || !organizationId) return;
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCustomer(user.id, organizationId, customerId);
      addToast('Customer deleted successfully!', 'success');
      await loadCustomersData();
    } catch (error) {
      console.error('Error deleting customer:', error);
      addToast('Failed to delete customer', 'error');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!user?.id || !organizationId) return;
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteVendor(user.id, organizationId, vendorId);
      addToast('Vendor deleted successfully!', 'success');
      await loadVendorsData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      addToast('Failed to delete vendor', 'error');
    }
  };

  return {
    // Data
    invoices,
    customers,
    vendors,
    expenses,
    expenseAccounts,
    reports,
    selectedExpense,
    setSelectedExpense,
    
    // Loading states
    loadingInvoices,
    loadingCustomers,
    loadingVendors,
    loadingExpenses,
    loadingReports,

    // Data loading functions
    loadInvoicesData,
    loadCustomersData,
    loadVendorsData,
    loadExpensesData,
    loadReportsData,
    loadExpenseAccountsData,
    loadDashboardData,

    // CRUD operations
    handleCreateInvoice,
    handleCreateCustomer,
    handleCreateVendor,
    handleCreateExpense,
    handleViewExpense,
    handleDeleteExpense,
    handleDeleteCustomer,
    handleDeleteVendor,
  };
}
