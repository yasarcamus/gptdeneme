import { TABAN_XP, ZORLUK_CARPAN } from './constants';

export const formatDateTime = (iso) => new Date(iso).toLocaleString('tr-TR');

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

export const getStreakMultiplier = (streak) => {
  if (streak >= 15) return 1.3;
  if (streak >= 8) return 1.2;
  if (streak >= 4) return 1.1;
  return 1.0;
};

export const calcLevel = (xpTotal) => Math.floor(xpTotal / 250) + 1;

export const calcRank = (level) => {
  if (level <= 2) return 'Çırak';
  if (level <= 4) return 'Usta';
  if (level <= 6) return 'Mimar';
  if (level <= 8) return 'Virtüöz';
  return 'Architect Prime';
};

export const calcTaskXp = ({ sure, zorluk, streak, repeatSameDay }) => {
  const base = TABAN_XP[sure] || 0;
  const diff = ZORLUK_CARPAN[zorluk] || 1;
  const streakMulti = getStreakMultiplier(streak);
  const repeatPenalty = repeatSameDay ? 0.5 : 1;
  return Math.round(base * diff * streakMulti * repeatPenalty);
};

export const isYesterday = (isoDate) => {
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return dayKey(isoDate) === y.toISOString().slice(0, 10);
};

export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
