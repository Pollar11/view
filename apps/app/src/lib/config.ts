import Constants from 'expo-constants';

/**
 * The app talks to exactly one host: the View API. Source URLs never reach
 * the client. Override with EXPO_PUBLIC_API_URL at build/run time.
 */
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  'http://localhost:4000/api';
