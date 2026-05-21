import { NAV_ITEMS } from '@/constants/weddingIdentityData';
import { WeddingIdentityPageId } from '@/types/weddingIdentity';
import React from 'react';
import Icon from './Icon';

interface WeddingIdentitySidebarProps {
  activePage: WeddingIdentityPageId;
  onPageChange: (pageId: WeddingIdentityPageId) => void;
}

const WeddingIdentitySidebar: React.FC<WeddingIdentitySidebarProps> = ({ activePage, onPageChange }) => (
  <aside className="wi-sidebar">
    <div className="wi-sidebar-logo">
      <div className="logo-label">Marriplan</div>
      <div className="logo-title">✦ Identidade do Casamento</div>
    </div>
    <nav className="wi-sidebar-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`wi-nav-link ${activePage === item.id ? 'active' : ''}`}
          onClick={() => onPageChange(item.id)}
        >
          <span className="nav-icon">
            <Icon
              name={item.icon}
              size={16}
              color={activePage === item.id ? 'var(--marriplan-rose)' : 'var(--marriplan-muted)'}
            />
          </span>
          {item.label}
        </button>
      ))}
    </nav>
    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--marriplan-border)' }}>
      <div style={{ fontSize: 11, color: 'var(--marriplan-muted)', lineHeight: 1.6 }}>
        <span style={{ fontWeight: 600, color: 'var(--marriplan-gold)' }}>✦ Ana & Rafael</span>
        <br />
        23 de maio de 2026
      </div>
    </div>
  </aside>
);

export default WeddingIdentitySidebar;
