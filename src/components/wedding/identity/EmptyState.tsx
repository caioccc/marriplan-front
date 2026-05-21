import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>{icon}</div>
    <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--marriplan-text)' }}>{title}</h3>
    <p style={{ fontSize: 13, color: 'var(--marriplan-muted)', maxWidth: 320, margin: '0 auto 20px' }}>{message}</p>
    {action}
  </div>
);

export default EmptyState;
