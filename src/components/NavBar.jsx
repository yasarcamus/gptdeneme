import React from 'react';

const tabs = [
  { key: 'dashboard', label: 'DASHBOARD' },
  { key: 'missions', label: 'MISSIONS' },
  { key: 'braindump', label: 'BRAIN DUMP' }
];

export default function NavBar({ active, onChange }) {
  return (
    <nav className="nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={active === tab.key ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
