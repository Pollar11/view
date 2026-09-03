import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Token storage. `expo-secure-store` (Keychain / Keystore) on native;
 * `localStorage` on web. Never stores anything but auth tokens.
 */
const memory = new Map<string, string>();

function webGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return webGet(key);
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        memory.delete(key);
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      memory.delete(key);
    }
  },
};

export const TOKEN_KEYS = {
  access: 'view.accessToken',
  refresh: 'view.refreshToken',
} as const;
