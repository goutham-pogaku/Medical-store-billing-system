import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';

const Reports = () => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);

  const periods = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'lifetime', label: 'Lifetime' }
  ];

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReports();
    } else {
      fetchInventoryReports();
    }
  }, [selectedPeriod, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSalesReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/reports/sales?period=${selectedPeriod}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/reports/inventory`);
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const SalesReports = () => (
    <div className="reports-content">
      <div className="period-selector">
        <h3>Sales Reports</h3>
        <div className="period-buttons">
          {periods.map(period => (
            <button
              key={period.value}
              className={`period-btn ${selectedPeriod === period.value ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {salesData && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h4>Total Bills</h4>
                <p className="stat-value">{formatNumber(salesData.summary.total_bills)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h4>Total Revenue</h4>
                <p className="stat-value">{formatCurrency(salesData.summary.total_revenue)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🧾</div>
              <div className="stat-info">
                <h4>Total Sales</h4>
                <p className="stat-value">{formatCurrency(salesData.summary.total_sales)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <h4>Total GST</h4>
                <p className="stat-value">{formatCurrency(salesData.summary.total_gst)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-info">
                <h4>Total Discount</h4>
                <p className="stat-value">{formatCurrency(salesData.summary.total_discount)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h4>Avg Bill Amount</h4>
                <p className="stat-value">{formatCurrency(salesData.summary.avg_bill_amount)}</p>
              </div>
            </div>
          </div>

          {salesData.topItems.length > 0 && (
            <div className="top-items-section">
              <h3>Top Selling Items</h3>
              <div className="top-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity Sold</th>
                      <th>Total Sales</th>
                      <th>Times Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.topItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item_name}</td>
                        <td>{formatNumber(item.total_quantity)}</td>
                        <td>{formatCurrency(item.total_sales)}</td>
                        <td>{formatNumber(item.times_sold)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {salesData.salesTrend.length > 0 && (
            <div className="sales-trend-section">
              <h3>Sales Trend</h3>
              <div className="trend-chart">
                {salesData.salesTrend.map((trend, index) => (
                  <div key={index} className="trend-item">
                    <div className="trend-date">{trend.date}</div>
                    <div className="trend-bar">
                      <div 
                        className="trend-fill"
                        style={{
                          width: `${(trend.revenue / Math.max(...salesData.salesTrend.map(t => t.revenue))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="trend-value">{formatCurrency(trend.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const InventoryReports = () => (
    <div className="reports-content">
      <h3>Inventory Reports</h3>
      
      {inventoryData && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h4>Total Items</h4>
                <p className="stat-value">{formatNumber(inventoryData.inventoryValue.total_items)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h4>Total Stock</h4>
                <p className="stat-value">{formatNumber(inventoryData.inventoryValue.total_stock)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h4>Inventory Value</h4>
                <p className="stat-value">{formatCurrency(inventoryData.inventoryValue.total_value)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h4>Low Stock Items</h4>
                <p className="stat-value">{formatNumber(inventoryData.lowStockItems.length)}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <h4>Out of Stock</h4>
                <p className="stat-value">{formatNumber(inventoryData.outOfStockItems.length)}</p>
              </div>
            </div>
          </div>

          <div className="inventory-sections">
            <div className="inventory-section">
              <h3>Stock by Category</h3>
              <div className="category-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Items</th>
                      <th>Total Stock</th>
                      <th>Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.stockByCategory.map((category, index) => (
                      <tr key={index}>
                        <td className="category-name">{category.category}</td>
                        <td>{formatNumber(category.item_count)}</td>
                        <td>{formatNumber(category.total_stock)}</td>
                        <td>{formatCurrency(category.stock_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {inventoryData.lowStockItems.length > 0 && (
              <div className="inventory-section">
                <h3>Low Stock Alert (Less than 10)</h3>
                <div className="alert-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.lowStockItems.map((item, index) => (
                        <tr key={index} className="low-stock-row">
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td className="stock-warning">{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {inventoryData.outOfStockItems.length > 0 && (
              <div className="inventory-section">
                <h3>Out of Stock Items</h3>
                <div className="alert-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.outOfStockItems.map((item, index) => (
                        <tr key={index} className="out-of-stock-row">
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{formatCurrency(item.price)}</td>
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

  return (
    <div>
      <Navbar />
      <div className="reports-container">
        <div className="reports-header">
          <h2>Reports & Analytics</h2>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales Reports
            </button>
            <button
              className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory Reports
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : (
          <>
            {activeTab === 'sales' ? <SalesReports /> : <InventoryReports />}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;