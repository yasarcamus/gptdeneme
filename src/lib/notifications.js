import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const WEB = Capacitor.getPlatform() === 'web';

const notifId = (taskId, suffix) => {
  const raw = `${taskId}`.replace(/\D/g, '').slice(-6);
  const seed = Number(raw || 1);
  return Number(`${seed}${suffix}`.slice(-9));
};

export const buildNotificationIds = (taskId) => ({
  before: notifId(taskId, 1),
  onTime: notifId(taskId, 2),
  missed: notifId(taskId, 3)
});

export const initNotificationPermission = async () => {
  if (WEB) return;
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') {
    throw new Error('Bildirim izni verilmedi.');
  }
};

export const cancelTaskNotifications = async (ids) => {
  if (WEB || !ids) return;
  await LocalNotifications.cancel({ notifications: Object.values(ids).map((id) => ({ id })) });
};

export const scheduleTaskNotifications = async (task) => {
  if (WEB) return;
  const deadline = new Date(task.deadline);
  const before = new Date(deadline.getTime() - 60 * 60 * 1000);
  const missed = new Date(deadline.getTime() + 60 * 1000);

  const ids = task.notificationIds || buildNotificationIds(task.id);
  await cancelTaskNotifications(ids);

  const notifications = [];
  if (before > new Date()) {
    notifications.push({
      id: ids.before,
      title: 'THE SYSTEM // Deadline -60',
      body: `${task.baslik} için 60 dakika kaldı.`,
      schedule: { at: before, allowWhileIdle: true },
      extra: { taskId: task.id, type: 'before' }
    });
  }

  if (deadline > new Date()) {
    notifications.push({
      id: ids.onTime,
      title: 'THE SYSTEM // Deadline Anı',
      body: `${task.baslik} süresi doldu. Durumu kontrol et.`,
      schedule: { at: deadline, allowWhileIdle: true },
      extra: { taskId: task.id, type: 'ontime' }
    });

    notifications.push({
      id: ids.missed,
      title: 'THE SYSTEM // BAŞARISIZLIK',
      body: `${task.baslik} deadline kaçtı. HP kaybı riski!`,
      schedule: { at: missed, allowWhileIdle: true },
      extra: { taskId: task.id, type: 'missed' }
    });
  }

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }

  return ids;
};
