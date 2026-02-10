import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import BrainDump from './pages/BrainDump';
import { SystemProvider } from './state/SystemContext';

export default function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <SystemProvider>
      <main className="app">
        <h1>THE SYSTEM // LIFE OS</h1>
        <NavBar active={tab} onChange={setTab} />
        {tab === 'dashboard' ? <Dashboard /> : null}
        {tab === 'missions' ? <Missions /> : null}
        {tab === 'braindump' ? <BrainDump /> : null}
      </main>
    </SystemProvider>
  );
}
