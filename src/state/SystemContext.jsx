import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HP_CEZA, KATEGORILER } from '../lib/constants';
import { calcLevel, calcRank, calcTaskXp, dayKey, isYesterday, todayKey, uid } from '../lib/helpers';
import {
  buildNotificationIds,
  initNotificationPermission,
  scheduleTaskNotifications
} from '../lib/notifications';

const KEY = 'the-system-v1';
const SystemContext = createContext(null);

const initialData = {
  player: {
    hp: 100,
    xpTotal: 0,
    xpByCategory: { EMPIRE: 0, WARFARE: 0, BIOLOGY: 0, INTEL: 0 },
    streak: 0,
    lastCompletionDate: null
  },
  tasks: [],
  brainDump: [],
  logs: []
};

const loadState = () => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialData;
  try {
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
};

export const SystemProvider = ({ children }) => {
  const [state, setState] = useState(loadState);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    initNotificationPermission().catch(() => {});
  }, []);

  useEffect(() => {
    // Failsafe: uygulama açıldığında tüm aktif görev bildirimleri tekrar planlanır.
    state.tasks
      .filter((t) => !t.completed)
      .forEach(async (task) => {
        const ids = await scheduleTaskNotifications(task);
        if (ids && !task.notificationIds) {
          setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((pt) => (pt.id === task.id ? { ...pt, notificationIds: ids } : pt))
          }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Deadline kaçan görevlerde HP cezasını tek sefer uygula.
    const now = new Date();
    const penalized = state.tasks.filter((t) => !t.completed && !t.penaltyApplied && new Date(t.deadline) < now);
    if (!penalized.length) return;

    setState((prev) => {
      let hp = prev.player.hp;
      const updatedTasks = prev.tasks.map((t) => {
        if (t.completed || t.penaltyApplied || new Date(t.deadline) >= now) return t;
        const ceza = HP_CEZA[t.zorluk] ?? 0;
        hp = Math.max(0, hp - ceza);
        return { ...t, penaltyApplied: true, penaltyAt: now.toISOString() };
      });

      const penaltyLogs = penalized.map(
        (t) => `>>> -${HP_CEZA[t.zorluk]} HP | ${t.kategori} | DEADLINE KAÇTI (${t.baslik})`
      );

      return {
        ...prev,
        player: { ...prev.player, hp },
        tasks: updatedTasks,
        logs: [...penaltyLogs, ...prev.logs].slice(0, 200)
      };
    });
  }, [state.tasks]);

  const activeTasks = useMemo(() => state.tasks.filter((t) => !t.completed), [state.tasks]);

  const mainQuestLimit = state.player.hp < 40 ? 2 : 3;

  const addTask = async (taskInput) => {
    setError('');

    if (activeTasks.length >= 7) {
      setError('Aynı anda maksimum 7 aktif görev olabilir.');
      return false;
    }

    const todayMainQuest = activeTasks.filter((t) => t.mainQuest && dayKey(t.createdAt) === todayKey()).length;
    if (taskInput.mainQuest && todayMainQuest >= mainQuestLimit) {
      setError(`Bugün Main Quest limiti: ${mainQuestLimit}`);
      return false;
    }

    const task = {
      id: uid(),
      ...taskInput,
      completed: false,
      createdAt: new Date().toISOString(),
      penaltyApplied: false,
      notificationIds: null
    };

    const ids = await scheduleTaskNotifications({ ...task, notificationIds: buildNotificationIds(task.id) });

    setState((prev) => ({
      ...prev,
      tasks: [{ ...task, notificationIds: ids || buildNotificationIds(task.id) }, ...prev.tasks]
    }));

    return true;
  };

  const completeTask = (taskId) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return prev;

      const completedTodaySameCategory = prev.tasks.filter(
        (t) => t.completed && t.kategori === task.kategori && dayKey(t.completedAt) === todayKey()
      ).length;

      const last = prev.player.lastCompletionDate;
      const today = todayKey();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);

      let streak = 1;
      if (last === today) streak = prev.player.streak;
      else if (last === yKey) streak = prev.player.streak + 1;

      const gainedXp = calcTaskXp({
        sure: task.sure,
        zorluk: task.zorluk,
        streak,
        repeatSameDay: completedTodaySameCategory > 0
      });

      const xpByCategory = {
        ...prev.player.xpByCategory,
        [task.kategori]: (prev.player.xpByCategory[task.kategori] || 0) + gainedXp
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          xpTotal: prev.player.xpTotal + gainedXp,
          xpByCategory,
          streak,
          lastCompletionDate: today
        },
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t)),
        logs: [`>>> +${gainedXp} XP | ${task.kategori} | TAMAMLANDI (${task.baslik})`, ...prev.logs].slice(0, 200)
      };
    });
  };

  const addBrainNote = (input) => {
    setState((prev) => ({
      ...prev,
      brainDump: [{ id: uid(), ...input, createdAt: new Date().toISOString() }, ...prev.brainDump]
    }));
  };

  const convertBrainToTask = async (note, defaults) => {
    const ok = await addTask({
      baslik: note.text.slice(0, 80),
      kategori: defaults.kategori,
      zorluk: defaults.zorluk,
      sure: defaults.sure,
      deadline: defaults.deadline,
      mainQuest: defaults.mainQuest,
      tags: note.tags
    });
    if (!ok) return;

    setState((prev) => ({ ...prev, brainDump: prev.brainDump.filter((b) => b.id !== note.id) }));
  };

  const level = calcLevel(state.player.xpTotal);
  const rank = calcRank(level);
  const warning = state.tasks.some((t) => t.penaltyAt && isYesterday(t.penaltyAt))
    ? 'UYARI: Dün deadline kaçırdın. Sistem güven düşüşünde.'
    : '';

  const value = {
    state,
    error,
    addTask,
    completeTask,
    addBrainNote,
    convertBrainToTask,
    level,
    rank,
    warning,
    mainQuestLimit,
    activeTasks,
    categories: KATEGORILER
  };

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};

export const useSystem = () => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('SystemContext bulunamadı');
  return ctx;
};
