import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer, {
  hydrated,
  sessionEstablished,
  signedOut,
} from './authSlice';
import { api } from './api';
import { storage, TOKEN_KEYS } from '@/lib/storage';
import type { AuthResponse } from '@view/shared';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Cold-start: load tokens from secure storage, then verify the session. */
export async function bootstrapAuth(): Promise<void> {
  const [access, refresh] = await Promise.all([
    storage.get(TOKEN_KEYS.access),
    storage.get(TOKEN_KEYS.refresh),
  ]);
  store.dispatch(hydrated({ accessToken: access, refreshToken: refresh }));

  if (!access && !refresh) return;
  try {
    const me = await store.dispatch(api.endpoints.me.initiate(undefined)).unwrap();
    store.dispatch(
      sessionEstablished({
        user: me,
        tokens: {
          accessToken: store.getState().auth.accessToken ?? access ?? '',
          refreshToken: store.getState().auth.refreshToken ?? refresh ?? '',
          expiresIn: 0,
        },
      }),
    );
  } catch {
    await persistTokens(null);
    store.dispatch(signedOut());
  }
}

export async function persistSession(auth: AuthResponse): Promise<void> {
  await storage.set(TOKEN_KEYS.access, auth.tokens.accessToken);
  await storage.set(TOKEN_KEYS.refresh, auth.tokens.refreshToken);
  store.dispatch(sessionEstablished(auth));
}

export async function persistTokens(
  tokens: { accessToken: string; refreshToken: string } | null,
): Promise<void> {
  if (!tokens) {
    await storage.remove(TOKEN_KEYS.access);
    await storage.remove(TOKEN_KEYS.refresh);
    return;
  }
  await storage.set(TOKEN_KEYS.access, tokens.accessToken);
  await storage.set(TOKEN_KEYS.refresh, tokens.refreshToken);
}

export async function clearSession(): Promise<void> {
  const refreshToken = store.getState().auth.refreshToken;
  try {
    await store
      .dispatch(api.endpoints.logout.initiate(refreshToken ? { refreshToken } : undefined))
      .unwrap();
  } catch {
    /* best effort */
  }
  await persistTokens(null);
  store.dispatch(signedOut());
  store.dispatch(api.util.resetApiState());
}
