import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Dashboard = () => {
  const { merchant } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {merchant?.storeName}</h1>
          <p>Owner: {merchant?.ownerName}</p>
        </div>
        
        <div className="dashboard-grid">
          <Link to="/inventory" className="dashboard-card">
            <div className="card-icon">📦</div>
            <h3>Inventory Management</h3>
            <p>Manage stock, upload Excel files, add new items</p>
          </Link>
          
          <Link to="/billing" className="dashboard-card">
            <div className="card-icon">🧾</div>
            <h3>Create Bill</h3>
            <p>Generate bills with GST calculation and discounts</p>
          </Link>
          
          <Link to="/bills" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>Bill History</h3>
            <p>View and print previous bills</p>
          </Link>
          
          <Link to="/reports" className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Reports & Analytics</h3>
            <p>Sales reports, inventory analysis, and business insights</p>
          </Link>
          
          <Link to="/financial" className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Financial Management</h3>
            <p>Agency payments, purchase tracking, and financial reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;