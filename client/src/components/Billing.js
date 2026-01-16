import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Navbar from './Navbar';

const Billing = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Items' },
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
    console.log('=== Fetching Inventory for Billing ===');
    try {
      const response = await axios.get(`${config.API_BASE_URL}/inventory`);
      const availableItems = response.data.filter(item => item.quantity > 0);
      console.log('✅ Available items:', availableItems.length);
      setInventory(availableItems);
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    const existingItem = selectedItems.find(selected => selected.itemId === item.item_id);
    
    if (existingItem) {
      if (existingItem.quantity < item.quantity) {
        setSelectedItems(selectedItems.map(selected =>
          selected.itemId === item.item_id
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        ));
      } else {
        alert('Not enough stock available');
      }
    } else {
      setSelectedItems([...selectedItems, {
        itemId: item.item_id,
        name: item.name,
        price: item.price,
        gstRate: item.gst_rate,
        quantity: 1,
        maxQuantity: item.quantity
      }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
    } else {
      const item = selectedItems.find(item => item.itemId === itemId);
      if (newQuantity <= item.maxQuantity) {
        setSelectedItems(selectedItems.map(item =>
          item.itemId === itemId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        alert('Not enough stock available');
      }
    }
  };

  const calculateBill = () => {
    let subtotal = 0;
    let totalGst = 0;

    selectedItems.forEach(item => {
      const itemTotal = item.quantity * item.price;
      const gstAmount = (itemTotal * item.gstRate) / 100;
      subtotal += itemTotal;
      totalGst += gstAmount;
    });

    const discountAmount = (subtotal * discount) / 100;
    const finalAmount = subtotal + totalGst - discountAmount;

    return { subtotal, totalGst, discountAmount, finalAmount };
  };

  const generateBill = async () => {
    console.log('=== Generating Bill ===');
    console.log('Selected items:', selectedItems);
    console.log('Customer:', customerName || 'Walk-in Customer');
    console.log('Discount:', discount);
    
    if (selectedItems.length === 0) {
      console.warn('⚠️ No items in cart');
      alert('Please add items to the cart');
      return;
    }

    try {
      const billData = {
        items: selectedItems,
        discount,
        customerName: customerName || 'Walk-in Customer',
        customerPhone
      };

      console.log('Sending bill data:', billData);
      const response = await axios.post(`${config.API_BASE_URL}/bills`, billData);
      console.log('✅ Bill generated:', response.data);
      
      // Print bill
      printBill(response.data);
      
      // Reset form
      setSelectedItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      
      // Refresh inventory
      fetchInventory();
      
      alert('Bill generated successfully!');
    } catch (error) {
      console.error('❌ Error generating bill:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || 'Error generating bill');
    }
  };

  const printBill = (billData) => {
    const printWindow = window.open('', '_blank');
    const billHtml = `
      <html>
        <head>
          <title>Bill - ${billData.billNumber}</title>
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
            <p>Bill No: ${billData.billNumber}</p>
            <p>Date: ${new Date(billData.date).toLocaleDateString()}</p>
          </div>
          
          <div class="bill-details">
            <p><strong>Customer:</strong> ${billData.customerName}</p>
            ${billData.customerPhone ? `<p><strong>Phone:</strong> ${billData.customerPhone}</p>` : ''}
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
                  <td>₹${item.unit_price}</td>
                  <td>${item.gst_rate}%</td>
                  <td>₹${item.item_total}</td>
                  <td>₹${item.gst_amount.toFixed(2)}</td>
                  <td>₹${(item.item_total + item.gst_amount).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ₹${billData.subtotal}</p>
            <p>Total GST: ₹${billData.totalGst.toFixed(2)}</p>
            ${billData.discount > 0 ? `<p>Discount (${billData.discount}%): -₹${billData.discountAmount.toFixed(2)}</p>` : ''}
            <p class="total-row">Final Amount: ₹${billData.finalAmount.toFixed(2)}</p>
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

  const { subtotal, totalGst, discountAmount, finalAmount } = calculateBill();

  return (
    <div>
      <Navbar />
      <div className="billing-container">
        <div className="billing-header">
          <h2>Create Bill</h2>
        </div>

        <div className="customer-details">
          <input
            type="text"
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Customer Phone (Optional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="billing-content">
          <div className="inventory-section">
            <div className="inventory-filters">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.value}
                    className={`category-tab ${activeCategory === category.value ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="items-grid">
              {filteredInventory.map(item => (
                <div key={item.id} className="inventory-item clickable" onClick={() => addToCart(item)}>
                  <h4>{item.name}</h4>
                  <p>Stock: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                  <p>GST: {item.gst_rate}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h3>Cart</h3>
            {selectedItems.length === 0 ? (
              <p>No items selected</p>
            ) : (
              <div className="cart-items">
                {selectedItems.map(item => (
                  <div key={item.itemId} className="cart-item">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bill-summary">
              <div className="discount-section">
                <label>Discount (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="totals">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>Total GST: ₹{totalGst.toFixed(2)}</p>
                {discount > 0 && <p>Discount: -₹{discountAmount.toFixed(2)}</p>}
                <h3>Final Amount: ₹{finalAmount.toFixed(2)}</h3>
              </div>

              <button 
                className="generate-bill-btn"
                onClick={generateBill}
                disabled={selectedItems.length === 0}
              >
                Generate & Print Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;