import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Item } from '@view/shared';

/**
 * Schedules a local notification ~15 min before each upcoming match the user
 * hasn't already been reminded about. Local-only — no push server, no tokens
 * leave the device. Web is a no-op (browser notifications need a SW setup).
 */
const scheduled = new Set<string>();
const LEAD_MS = 15 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function syncMatchReminders(upcoming: Item[], enabled: boolean): Promise<void> {
  if (Platform.OS === 'web' || !enabled) return;
  if (!(await ensureNotificationPermission())) return;

  const now = Date.now();
  for (const item of upcoming) {
    if (item.category !== 'sports' || !item.startsAt) continue;
    const start = new Date(item.startsAt).getTime();
    const fireAt = start - LEAD_MS;
    if (scheduled.has(item.id) || fireAt <= now || start - now > 3 * 24 * 3600 * 1000) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Starting soon',
        body: `${item.title} kicks off in 15 minutes.`,
        data: { itemId: item.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(fireAt) },
    });
    scheduled.add(item.id);
  }
}
