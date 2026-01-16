import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    quantity: '',
    price: '',
    gstRate: '18',
    batchNumber: '',
    manufacturer: ''
  });

  const categories = [
    { value: 'tablets', label: 'Tablets' },
    { value: 'syrups', label: 'Syrups' },
    { value: 'injections', label: 'Injections' },
    { value: 'capsules', label: 'Capsules' },
    { value: 'ointments', label: 'Ointments' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    console.log('=== Fetching Inventory ===');
    console.log('API URL:', `${config.API_BASE_URL}/inventory`);
    
    try {
      const response = await axios.get(`${config.API_BASE_URL}/inventory`);
      console.log('✅ Inventory fetched:', response.data.length, 'items');
      setInventory(response.data);
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('=== Uploading Excel File ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size, 'bytes');

    const formData = new FormData();
    formData.append('excel', file);

    setLoading(true);
    try {
      console.log('Uploading to:', `${config.API_BASE_URL}/inventory/excel`);
      await axios.post(`${config.API_BASE_URL}/inventory/excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Excel file uploaded successfully');
      fetchInventory();
      alert('Inventory updated successfully from Excel!');
    } catch (error) {
      console.error('❌ Error uploading Excel file:', error);
      console.error('Error response:', error.response?.data);
      alert('Error uploading Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    console.log('=== Adding Item Manually ===');
    console.log('Item data:', formData);
    
    try {
      await axios.post(`${config.API_BASE_URL}/inventory/manual`, formData);
      console.log('✅ Item added successfully');
      setFormData({
        name: '',
        category: 'general',
        quantity: '',
        price: '',
        gstRate: '18',
        batchNumber: '',
        manufacturer: ''
      });
      setShowAddForm(false);
      fetchInventory();
      alert('Item added successfully!');
    } catch (error) {
      alert('Error adding item');
    }
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Block special characters ONLY for Item Name
  if (name === "name") {
    const nameRegex = /^[A-Za-z0-9\s]+$/; // letters, numbers, spaces
    if (!nameRegex.test(value) && value !== "") {
      return; // stop typing invalid characters
    }
  }

  setFormData({
    ...formData,
    [name]: value
  });
};
  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <Navbar />
      <div className="inventory-container">
        <div className="inventory-header">
          <h2>Inventory Management</h2>
          <div className="inventory-actions">
            <label className="file-upload-btn">
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-item-btn"
            >
              Add Item Manually
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="add-item-form">
            <div className="form-header">
              <h3>Add New Item to Inventory</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="item-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="name">Item Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter medicine/item name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Pricing & Stock</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="quantity">Quantity *</label>
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      placeholder="0"
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="price">Unit Price (₹) *</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      name="price"
                      placeholder="0.00"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="gstRate">GST Rate (%)</label>
                    <select
                      id="gstRate"
                      name="gstRate"
                      value={formData.gstRate}
                      onChange={handleInputChange}
                    >
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% (Essential medicines)</option>
                      <option value="12">12% (Medical devices)</option>
                      <option value="18">18% (Standard rate)</option>
                      <option value="28">28% (Luxury items)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Additional Details (Optional)</h4>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="batchNumber">Batch Number</label>
                    <input
                      id="batchNumber"
                      type="text"
                      name="batchNumber"
                      placeholder="e.g., BATCH001"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="manufacturer">Manufacturer</label>
                    <input
                      id="manufacturer"
                      type="text"
                      name="manufacturer"
                      placeholder="e.g., ABC Pharmaceuticals"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <span>📦</span> Add Item to Inventory
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="inventory-grid">
          {Object.entries(groupedInventory).map(([category, items]) => (
            <div key={category} className="category-section">
              <h3>{categories.find(c => c.value === category)?.label || category}</h3>
              <div className="items-grid">
                {items.map(item => (
                  <div key={item.id} className="inventory-item">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.price}</p>
                    <p>GST: {item.gst_rate}%</p>
                    {item.batch_number && <p>Batch: {item.batch_number}</p>}
                    {item.manufacturer && <p>Mfg: {item.manufacturer}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="loading">Processing...</div>}
      </div>
    </div>
  );
};

export default Inventory;