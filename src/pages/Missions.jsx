import React, { useMemo, useState } from 'react';
import { KATEGORILER, SURELER, ZORLUKLAR } from '../lib/constants';
import { formatDateTime } from '../lib/helpers';
import { useSystem } from '../state/SystemContext';

const defaultDeadline = () => {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  return d.toISOString().slice(0, 16);
};

export default function Missions() {
  const { addTask, completeTask, state, error, mainQuestLimit, activeTasks } = useSystem();
  const [form, setForm] = useState({
    baslik: '',
    kategori: 'EMPIRE',
    zorluk: 'C',
    sure: 30,
    deadline: defaultDeadline(),
    mainQuest: false
  });

  const pending = useMemo(() => state.tasks.filter((t) => !t.completed), [state.tasks]);
  const done = useMemo(() => state.tasks.filter((t) => t.completed).slice(0, 10), [state.tasks]);

  const submit = async (e) => {
    e.preventDefault();
    const ok = await addTask({
      ...form,
      sure: Number(form.sure),
      deadline: new Date(form.deadline).toISOString(),
      tags: []
    });
    if (ok) {
      setForm((prev) => ({ ...prev, baslik: '', deadline: defaultDeadline(), mainQuest: false }));
    }
  };

  return (
    <section className="panel">
      <h2>{'>> MISSION COMMAND'}</h2>
      <p className="muted">Aktif görev: {activeTasks.length}/7 | Main Quest limit: {mainQuestLimit}</p>
      {error ? <p className="warning">{error}</p> : null}

      <form className="form" onSubmit={submit}>
        <input
          required
          value={form.baslik}
          onChange={(e) => setForm((p) => ({ ...p, baslik: e.target.value }))}
          placeholder="Görev başlığı"
        />
        <select value={form.kategori} onChange={(e) => setForm((p) => ({ ...p, kategori: e.target.value }))}>
          {KATEGORILER.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <select value={form.zorluk} onChange={(e) => setForm((p) => ({ ...p, zorluk: e.target.value }))}>
          {ZORLUKLAR.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
        <select value={form.sure} onChange={(e) => setForm((p) => ({ ...p, sure: Number(e.target.value) }))}>
          {SURELER.map((s) => (
            <option key={s} value={s}>{s} dk</option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={form.deadline}
          onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          required
        />
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.mainQuest}
            onChange={(e) => setForm((p) => ({ ...p, mainQuest: e.target.checked }))}
          />
          Main Quest
        </label>
        <button type="submit">GÖREV EKLE</button>
      </form>

      <h3>{'>> AKTİF GÖREVLER'}</h3>
      <ul>
        {pending.map((task) => (
          <li key={task.id}>
            [{task.kategori}] {task.baslik} | {task.sure} dk | Zorluk {task.zorluk} | {formatDateTime(task.deadline)}
            {task.mainQuest ? ' | MAIN' : ''}
            <button onClick={() => completeTask(task.id)}>TAMAMLA</button>
          </li>
        ))}
        {pending.length === 0 ? <li className="muted">Aktif görev yok.</li> : null}
      </ul>

      <h3>{'>> SON TAMAMLANANLAR'}</h3>
      <ul>
        {done.map((task) => (
          <li key={task.id}>[{task.kategori}] {task.baslik} | {formatDateTime(task.completedAt)}</li>
        ))}
      </ul>
    </section>
  );
}
