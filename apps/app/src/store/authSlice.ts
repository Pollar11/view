import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens, PublicUser } from '@view/shared';

export interface AuthState {
  user: PublicUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** false until we've checked storage on cold start. */
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrated(state, action: PayloadAction<{ accessToken: string | null; refreshToken: string | null }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.hydrated = true;
    },
    sessionEstablished(
      state,
      action: PayloadAction<{ user: PublicUser; tokens: AuthTokens }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
    },
    tokensRefreshed(state, action: PayloadAction<AuthTokens>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    userUpdated(state, action: PayloadAction<PublicUser>) {
      state.user = action.payload;
    },
    signedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { hydrated, sessionEstablished, tokensRefreshed, userUpdated, signedOut } =
  authSlice.actions;
export default authSlice.reducer;
