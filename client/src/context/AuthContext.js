import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [merchant, setMerchant] = useState(JSON.parse(localStorage.getItem('merchant') || 'null'));
  const [loading, setLoading] = useState(false);

  // Set up axios interceptor
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log('🌐 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: {
            'Content-Type': config.headers['Content-Type'],
            'Authorization': config.headers['Authorization'] ? 'Bearer ***' : 'none'
          }
        });
        
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('❌ API Error Response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          errorData: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    console.log('=== AuthContext.login called ===');
    console.log('API URL:', `${config.API_BASE_URL}/auth/login`);
    console.log('Email:', email);
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('✅ Login response:', response.data);
      
      const { token: newToken, merchant: merchantData } = response.data;
      
      setToken(newToken);
      setMerchant(merchantData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('merchant', JSON.stringify(merchantData));
      
      console.log('✅ Token and merchant data saved to localStorage');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    console.log('=== AuthContext.register called ===');
    console.log('API URL:', `${config.API_BASE_URL}/auth/register`);
    console.log('Form data being sent:', JSON.stringify(formData, null, 2));
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/register`, formData);
      console.log('✅ Registration response:', JSON.stringify(response.data, null, 2));
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error response headers:', JSON.stringify(error.response?.headers, null, 2));
      
      // Return detailed error information
      const errorData = error.response?.data;
      const status = error.response?.status;
      
      if (errorData) {
        console.error('Parsed error data:', JSON.stringify(errorData, null, 2));
        
        // Add helpful messages based on status code
        let userMessage = errorData.error || 'Registration failed';
        
        if (status === 500) {
          userMessage = 'Server error. This is likely a database issue. Please check backend logs on Render.';
          console.error('💡 TIP: Check Render logs for database connection errors or missing tables');
        } else if (status === 400) {
          userMessage = errorData.error || 'Validation failed';
        }
        
        return { 
          success: false, 
          error: {
            ...errorData,
            userMessage,
            status
          }
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Registration failed - network error' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setMerchant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
  };

  const value = {
    token,
    merchant,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};