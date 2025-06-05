import React, { useState } from 'react';

interface DevAuthComponentProps {
  onTokenSubmit: (token: string) => void;
  error?: string | null;
}

export const DevAuthComponent: React.FC<DevAuthComponentProps> = ({ 
  onTokenSubmit, 
  error 
}) => {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSubmitting(true);
    try {
      onTokenSubmit(token.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#1f2937',
        }}>
          Development Authentication
        </h2>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
        }}>
          Enter a JWT token for development testing
        </p>

        <form onSubmit={handleSubmit} role="form">
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="token"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              JWT Token
            </label>
            <textarea
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!token.trim() || isSubmitting}
            style={{
              width: '100%',
              backgroundColor: isSubmitting || !token.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isSubmitting || !token.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease-in-out',
            }}
          >
            {isSubmitting ? 'Validating...' : 'Set Token'}
          </button>
        </form>
      </div>
    </div>
  );
};