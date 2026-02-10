import React from 'react';
import { useSystem } from '../state/SystemContext';

export default function Dashboard() {
  const { state, level, rank, warning } = useSystem();
  const mainToday = state.tasks
    .filter((t) => t.mainQuest && !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <section className="panel">
      <h2>{'>> STATUS'}</h2>
      <div className="grid">
        <p>LEVEL: {level}</p>
        <p>RANK: {rank}</p>
        <p>HP: {state.player.hp}</p>
        <p>STREAK: {state.player.streak} gün</p>
      </div>

      <h3>{'>> BUGÜNÜN MAIN QUESTLERİ'}</h3>
      {mainToday.length === 0 ? <p className="muted">Aktif Main Quest yok.</p> : null}
      <ul>
        {mainToday.map((q) => (
          <li key={q.id}>
            [{q.kategori}] {q.baslik} | {new Date(q.deadline).toLocaleString('tr-TR')}
          </li>
        ))}
      </ul>

      {warning ? <p className="warning">{warning}</p> : <p className="muted">Sistem stabil.</p>}

      <h3>{'>> TERMINAL LOG'}</h3>
      <div className="log-box">
        {state.logs.slice(0, 8).map((line, idx) => (
          <p key={`${line}-${idx}`}>{line}</p>
        ))}
        {state.logs.length === 0 ? <p className="muted">Log yok.</p> : null}
      </div>
    </section>
  );
}
