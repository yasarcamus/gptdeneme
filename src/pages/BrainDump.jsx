import React, { useState } from 'react';
import { KATEGORILER, SURELER, ZORLUKLAR } from '../lib/constants';
import { useSystem } from '../state/SystemContext';

const defaultDeadline = () => {
  const d = new Date();
  d.setHours(d.getHours() + 4);
  return d.toISOString().slice(0, 16);
};

export default function BrainDump() {
  const { state, addBrainNote, convertBrainToTask } = useSystem();
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');

  const [defaults, setDefaults] = useState({
    kategori: 'INTEL',
    zorluk: 'B',
    sure: 30,
    deadline: defaultDeadline(),
    mainQuest: false
  });

  const submit = (e) => {
    e.preventDefault();
    addBrainNote({ text, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) });
    setText('');
    setTags('');
  };

  return (
    <section className="panel">
      <h2>{'>> BRAIN DUMP DEPOT'}</h2>
      <form className="form" onSubmit={submit}>
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Serbest metin / fikir / not"
        />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="etiket1, etiket2" />
        <button type="submit">DEPOYA EKLE</button>
      </form>

      <h3>{'>> GÖREVE DÖNÜŞTÜR AYARLARI'}</h3>
      <div className="inline-form">
        <select value={defaults.kategori} onChange={(e) => setDefaults((p) => ({ ...p, kategori: e.target.value }))}>
          {KATEGORILER.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <select value={defaults.zorluk} onChange={(e) => setDefaults((p) => ({ ...p, zorluk: e.target.value }))}>
          {ZORLUKLAR.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
        <select value={defaults.sure} onChange={(e) => setDefaults((p) => ({ ...p, sure: Number(e.target.value) }))}>
          {SURELER.map((s) => (
            <option key={s} value={s}>{s} dk</option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={defaults.deadline}
          onChange={(e) => setDefaults((p) => ({ ...p, deadline: e.target.value }))}
        />
        <label className="checkbox">
          <input
            type="checkbox"
            checked={defaults.mainQuest}
            onChange={(e) => setDefaults((p) => ({ ...p, mainQuest: e.target.checked }))}
          />
          Main
        </label>
      </div>

      <ul>
        {state.brainDump.map((note) => (
          <li key={note.id}>
            <p>{note.text}</p>
            <small>Etiketler: {note.tags.join(', ') || '-'}</small>
            <button
              onClick={() =>
                convertBrainToTask(note, {
                  ...defaults,
                  deadline: new Date(defaults.deadline).toISOString()
                })
              }
            >
              GÖREVE DÖNÜŞTÜR
            </button>
          </li>
        ))}
        {state.brainDump.length === 0 ? <li className="muted">Depo boş.</li> : null}
      </ul>
    </section>
  );
}
