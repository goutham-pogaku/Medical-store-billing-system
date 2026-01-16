import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // IMPORTANT — get token for all axios calls
  const token = localStorage.getItem("token");

  // FETCH SUPPLIERS
  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/suppliers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, [token]);

  // FETCH PAYMENTS
  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, [token]);

  // FETCH FINANCIAL REPORTS
  const fetchFinancialReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/reports/financial`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSuppliers();
    fetchFinancialReports();
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab, fetchSuppliers, fetchFinancialReports, fetchPayments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // SUPPLIER FORM
  const SupplierFormComponent = () => {
    const [formData, setFormData] = useState({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      paymentTerms: 'Net 30'
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${config.API_BASE_URL}/suppliers`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          gstNumber: '',
          paymentTerms: 'Net 30'
        });
        setShowSupplierForm(false);
        fetchSuppliers();
        alert('Supplier added successfully!');
      } catch (error) {
        const errorMsg = error.response?.data?.details
          ? error.response.data.details.map(d => d.msg).join(', ')
          : error.response?.data?.error || 'Error adding supplier';
        alert(errorMsg);
      }
    };

    return (
      <div className="supplier-form">
        <h4>Add New Supplier</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Payment Terms</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
              >
                <option value="Net 15">Net 15 days</option>
                <option value="Net 30">Net 30 days</option>
                <option value="Net 45">Net 45 days</option>
                <option value="Net 60">Net 60 days</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="form-field full-width">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit">Add Supplier</button>
            <button type="button" onClick={() => setShowSupplierForm(false)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  // PAYMENT FORM
  const PaymentFormComponent = () => {
    const [formData, setFormData] = useState({
      supplierId: '',
      purchaseId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      referenceNumber: '',
      notes: ''
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${config.API_BASE_URL}/payments`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData({
          supplierId: '',
          purchaseId: '',
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          referenceNumber: '',
          notes: ''
        });
        setShowPaymentForm(false);
        fetchPayments();
        fetchFinancialReports();
        alert('Payment recorded successfully!');
      } catch (error) {
        const errorMsg = error.response?.data?.details
          ? error.response.data.details.map(d => d.msg).join(', ')
          : error.response?.data?.error || 'Error recording payment';
        alert(errorMsg);
      }
    };

    return (
      <div className="payment-form">
        <h4>Record Payment to Supplier</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Supplier *</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="form-field">
              <label>Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Transaction ID, Cheque No, etc."
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="submit">Record Payment</button>
            <button type="button" onClick={() => setShowPaymentForm(false)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  // OVERVIEW TAB
  const OverviewTab = () => (
    <div className="financial-overview">
      {financialData && (
        <>
          <div className="financial-stats">
            <div className="stat-card total-purchases">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h4>Total Purchases</h4>
                <p className="stat-value">{formatCurrency(financialData.financialSummary.total_purchases)}</p>
              </div>
            </div>

            <div className="stat-card total-paid">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h4>Total Paid</h4>
                <p className="stat-value">{formatCurrency(financialData.financialSummary.total_payments)}</p>
              </div>
            </div>

            <div className="stat-card outstanding">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h4>Outstanding Amount</h4>
                <p className="stat-value">{formatCurrency(financialData.financialSummary.total_outstanding)}</p>
              </div>
            </div>
          </div>

          <div className="financial-sections">
            <div className="section">
              <h3>Supplier Summary</h3>
              <div className="supplier-summary-table">
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Total Purchased</th>
                      <th>Total Paid</th>
                      <th>Balance Due</th>
                      <th>Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.supplierSummary.map((supplier, index) => (
                      <tr key={index}>
                        <td>{supplier.company_name}</td>
                        <td>{formatCurrency(supplier.total_purchased)}</td>
                        <td>{formatCurrency(supplier.total_paid)}</td>
                        <td className={supplier.balance_due > 0 ? 'amount-due' : ''}>
                          {formatCurrency(supplier.balance_due)}
                        </td>
                        <td>{supplier.total_invoices}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {financialData.overduePayments.length > 0 && (
              <div className="section">
                <h3>Overdue Payments</h3>
                <div className="overdue-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Invoice</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                        <th>Amount Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.overduePayments.map((payment, index) => (
                        <tr key={index} className="overdue-row">
                          <td>{payment.company_name}</td>
                          <td>{payment.invoice_number}</td>
                          <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                          <td className="days-overdue">{payment.days_overdue} days</td>
                          <td>{formatCurrency(payment.balance_due)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const SuppliersTab = () => (
    <div className="suppliers-section">
      <div className="section-header">
        <h3>Suppliers Management</h3>
        <button
          className="add-btn"
          onClick={() => setShowSupplierForm(!showSupplierForm)}
        >
          {showSupplierForm ? 'Cancel' : 'Add New Supplier'}
        </button>
      </div>

      {showSupplierForm && <SupplierFormComponent />}

      <div className="suppliers-table">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Payment Terms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No suppliers added yet. Click "Add New Supplier" to get started.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={index}>
                  <td>{supplier.company_name}</td>
                  <td>{supplier.contact_person}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.payment_terms}</td>
                  <td>
                    <span className={`status ${supplier.status}`}>
                      {supplier.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PaymentsTab = () => (
    <div className="payments-section">
      <div className="section-header">
        <h3>Payment Management</h3>
        <button
          className="add-btn"
          onClick={() => setShowPaymentForm(!showPaymentForm)}
        >
          {showPaymentForm ? 'Cancel' : 'Record Payment'}
        </button>
      </div>

      {showPaymentForm && <PaymentFormComponent />}

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No payments recorded yet. Click "Record Payment" to add one.
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr key={index}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>{payment.company_name}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td className="payment-method">{payment.payment_method.replace('_', ' ')}</td>
                  <td>{payment.reference_number}</td>
                  <td>{payment.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="financial-container">
        <div className="financial-header">
          <h2>Financial Management</h2>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Suppliers
            </button>
            <button
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
          </div>
        </div>

        <div className="financial-content">
          {loading ? (
            <div className="loading">Loading financial data...</div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'suppliers' && <SuppliersTab />}
              {activeTab === 'payments' && <PaymentsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Financial;
