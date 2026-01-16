import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const TestRegistration = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testData = {
    storeName: 'Test Pharmacy',
    ownerName: 'John Doe',
    email: 'test@example.com',
    password: 'password123',
    phone: '1234567890',
    address: '123 Test Street',
    gstNumber: 'GST123456',
    licenseNumber: 'LIC123456'
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult(null);

    console.log('=== TEST REGISTRATION ===');
    console.log('API URL:', `${config.API_BASE_URL}/auth/register`);
    console.log('Test data:', JSON.stringify(testData, null, 2));

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/register`, testData);
      console.log('✅ Success:', response.data);
      setResult({
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      setResult({
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Registration Test Page</h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Test Data:</h3>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>

      <button
        onClick={testRegistration}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Testing...' : 'Test Registration'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            color: result.success ? '#155724' : '#721c24',
            marginTop: 0 
          }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          
          {result.success ? (
            <pre style={{ 
              backgroundColor: '#fff', 
              padding: '15px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          ) : (
            <>
              <p><strong>Status Code:</strong> {result.status}</p>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '15px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.error, null, 2)}
              </pre>
              
              {result.error?.details && (
                <div style={{ marginTop: '15px' }}>
                  <h4>Validation Errors:</h4>
                  <ul>
                    {result.error.details.map((err, idx) => (
                      <li key={idx}>
                        <strong>{err.path || err.param}:</strong> {err.msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>Instructions:</h3>
        <ol>
          <li>Click "Test Registration" button</li>
          <li>Check the result below</li>
          <li>If error, see the exact validation errors</li>
          <li>Open Debug Console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default TestRegistration;
