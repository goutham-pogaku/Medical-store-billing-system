import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/bills`);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const reprintBill = async (billId) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/bills/${billId}`);
      printBill(response.data);
    } catch (error) {
      alert('Error fetching bill details');
    }
  };

  const printBill = (billData) => {
    const printWindow = window.open('', '_blank');
    const billHtml = `
      <html>
        <head>
          <title>Bill - ${billData.bill_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Medical Store Bill</h2>
            <p>Bill No: ${billData.bill_number}</p>
            <p>Date: ${new Date(billData.created_at).toLocaleDateString()}</p>
          </div>
          
          <div class="bill-details">
            <p><strong>Customer:</strong> ${billData.customer_name}</p>
            ${billData.customer_phone ? `<p><strong>Phone:</strong> ${billData.customer_phone}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>GST%</th>
                <th>Amount</th>
                <th>GST Amt</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>${item.gst_rate}%</td>
                  <td>₹${parseFloat(item.item_total).toFixed(2)}</td>
                  <td>₹${parseFloat(item.gst_amount).toFixed(2)}</td>
                  <td>₹${(parseFloat(item.item_total) + parseFloat(item.gst_amount)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ₹${parseFloat(billData.subtotal).toFixed(2)}</p>
            <p>Total GST: ₹${parseFloat(billData.total_gst).toFixed(2)}</p>
            ${parseFloat(billData.discount_percent) > 0 ? `<p>Discount (${billData.discount_percent}%): -₹${parseFloat(billData.discount_amount).toFixed(2)}</p>` : ''}
            <p class="total-row">Final Amount: ₹${parseFloat(billData.final_amount).toFixed(2)}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(billHtml);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading bills...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="bill-history-container">
        <div className="bill-history-header">
          <h2>Bill History</h2>
        </div>

        {bills.length === 0 ? (
          <div className="no-bills">
            <p>No bills found</p>
          </div>
        ) : (
          <div className="bills-table">
            <table>
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.bill_number}</td>
                    <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td>{bill.customer_name}</td>
                    <td>{bill.items_summary}</td>
                    <td>₹{parseFloat(bill.final_amount).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => reprintBill(bill.id)}
                        className="reprint-btn"
                      >
                        Reprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistory;