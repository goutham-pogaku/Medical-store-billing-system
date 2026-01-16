import React, { useState, useEffect, useRef } from 'react';

const DebugConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const logsEndRef = useRef(null);
  const originalConsole = useRef({});

  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // Override console methods
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { 
        type: 'log', 
        message, 
        time: new Date().toLocaleTimeString() 
      }]);
      originalConsole.current.log.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { 
        type: 'error', 
        message, 
        time: new Date().toLocaleTimeString() 
      }]);
      originalConsole.current.error.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { 
        type: 'warn', 
        message, 
        time: new Date().toLocaleTimeString() 
      }]);
      originalConsole.current.warn.apply(console, args);
    };

    console.info = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { 
        type: 'info', 
        message, 
        time: new Date().toLocaleTimeString() 
      }]);
      originalConsole.current.info.apply(console, args);
    };

    // Log initial message
    console.log('🔍 Debug Console initialized');

    // Cleanup on unmount
    return () => {
      console.log = originalConsole.current.log;
      console.error = originalConsole.current.error;
      console.warn = originalConsole.current.warn;
      console.info = originalConsole.current.info;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isVisible && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isVisible]);

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        🔍 Show Debug Console ({logs.length})
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '700px',
      maxWidth: '90vw',
      height: '500px',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '12px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
      borderTopLeftRadius: '8px'
    }}>
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#2d2d2d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #3e3e3e',
        borderTopLeftRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong style={{ fontSize: '14px' }}>🔍 Debug Console</strong>
          <span style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {logs.length} logs
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={downloadLogs}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            title="Download logs as text file"
          >
            💾 Download
          </button>
          <button
            onClick={() => setLogs([])}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🗑️ Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            ➖ Hide
          </button>
        </div>
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        backgroundColor: '#1e1e1e'
      }}>
        {logs.length === 0 ? (
          <div style={{ 
            color: '#888', 
            textAlign: 'center', 
            marginTop: '20px',
            fontSize: '14px'
          }}>
            No logs yet... Perform actions to see logs here.
          </div>
        ) : (
          <>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  borderLeft: `4px solid ${
                    log.type === 'error' ? '#dc3545' :
                    log.type === 'warn' ? '#ffc107' :
                    log.type === 'info' ? '#17a2b8' :
                    '#28a745'
                  }`,
                  backgroundColor: log.type === 'error' ? '#3a1f1f' : 
                                   log.type === 'warn' ? '#3a3520' :
                                   'transparent',
                  borderRadius: '4px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ 
                    color: '#888', 
                    marginRight: '10px',
                    fontSize: '11px'
                  }}>
                    {log.time}
                  </span>
                  <span style={{
                    color: log.type === 'error' ? '#f48771' :
                           log.type === 'warn' ? '#dcdcaa' :
                           log.type === 'info' ? '#4fc1ff' :
                           '#4ec9b0',
                    fontWeight: 'bold',
                    fontSize: '11px'
                  }}>
                    [{log.type.toUpperCase()}]
                  </span>
                </div>
                <div style={{ 
                  marginLeft: '10px',
                  color: log.type === 'error' ? '#f48771' : '#d4d4d4'
                }}>
                  {log.message}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default DebugConsole;
