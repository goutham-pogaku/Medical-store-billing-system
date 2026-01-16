import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== REACT ERROR BOUNDARY ===');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '50px auto',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: '#856404', marginBottom: '20px' }}>
            ⚠️ Something went wrong
          </h1>
          <p style={{ marginBottom: '20px', fontSize: '16px' }}>
            The application encountered an error. Please check the debug console for details.
          </p>
          
          <details style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              Error Details
            </summary>
            <pre style={{ 
              overflow: 'auto', 
              fontSize: '12px',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
