import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, actions }) => (
  <div className="wi-page-header">
    {eyebrow && <div className="eyebrow">{eyebrow}</div>}
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
    {actions && <div className="actions">{actions}</div>}
  </div>
);

export default SectionHeader;
