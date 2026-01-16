const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://medical-store-billing-system.onrender.com/api'
    : 'http://localhost:5000/api'
};

export default config;
