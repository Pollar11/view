import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from './mutex';
import { API_URL } from '@/lib/config';
import { storage, TOKEN_KEYS } from '@/lib/storage';
import { signedOut, tokensRefreshed } from './authSlice';
import type { RootState } from './index';
import type {
  AuthResponse,
  HealthReport,
  HomeFeed,
  Interaction,
  InteractionDto,
  Item,
  ItemQuery,
  LoginDto,
  Paginated,
  PublicUser,
  Recommendation,
  RegisterDto,
  UserPreferences,
} from '@view/shared';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const refreshMutex = new Mutex();

/**
 * Wraps every request: on a 401, transparently refreshes the token once
 * (single-flight via a mutex) and replays the original request. If refresh
 * fails, the session is cleared.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiCtx,
  extraOptions,
) => {
  await refreshMutex.wait();
  let result = await rawBaseQuery(args, apiCtx, extraOptions);

  if (result.error?.status === 401) {
    const state = apiCtx.getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    if (!refreshToken) {
      apiCtx.dispatch(signedOut());
      return result;
    }

    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire();
      try {
        const refresh = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
          apiCtx,
          extraOptions,
        );
        const data = refresh.data as AuthResponse | undefined;
        if (data?.tokens) {
          await storage.set(TOKEN_KEYS.access, data.tokens.accessToken);
          await storage.set(TOKEN_KEYS.refresh, data.tokens.refreshToken);
          apiCtx.dispatch(tokensRefreshed(data.tokens));
          result = await rawBaseQuery(args, apiCtx, extraOptions);
        } else {
          await storage.remove(TOKEN_KEYS.access);
          await storage.remove(TOKEN_KEYS.refresh);
          apiCtx.dispatch(signedOut());
        }
      } finally {
        release();
      }
    } else {
      await refreshMutex.wait();
      result = await rawBaseQuery(args, apiCtx, extraOptions);
    }
  }
  return result;
};

const qs = (q: ItemQuery): string => {
  const p = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Home', 'Item', 'Favorites', 'History', 'Reco', 'Me'],
  endpoints: (build) => ({
    /* auth */
    register: build.mutation<AuthResponse, RegisterDto>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: build.mutation<AuthResponse, LoginDto>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: build.mutation<void, { refreshToken: string } | void>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body: body || {} }),
    }),
    me: build.query<PublicUser, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    updatePreferences: build.mutation<PublicUser, Partial<UserPreferences>>({
      query: (body) => ({ url: '/users/me/preferences', method: 'PATCH', body }),
      invalidatesTags: ['Me', 'Reco', 'Home'],
    }),
    updateProfile: build.mutation<PublicUser, { displayName: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),

    /* catalogue */
    home: build.query<HomeFeed, void>({
      query: () => '/home',
      providesTags: ['Home'],
    }),
    items: build.query<Paginated<Item>, ItemQuery>({
      query: (q) => `/items${qs(q)}`,
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}(${JSON.stringify({ ...queryArgs, page: undefined })})`,
      merge: (current, incoming) => {
        if (incoming.page === 1) return incoming;
        current.items.push(...incoming.items);
        current.page = incoming.page;
        current.hasNext = incoming.hasNext;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        JSON.stringify(currentArg) !== JSON.stringify(previousArg),
    }),
    item: build.query<Item, string>({
      query: (id) => `/items/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Item', id }],
    }),
    itemSource: build.query<{ url: string }, string>({
      query: (id) => `/items/${id}/source`,
    }),
    search: build.query<Paginated<Item>, { q: string; page?: number }>({
      query: ({ q, page }) => `/search?q=${encodeURIComponent(q)}${page ? `&page=${page}` : ''}`,
    }),
    upcoming: build.query<Item[], void>({
      query: () => '/items/upcoming',
    }),

    /* personalization */
    recommendations: build.query<Recommendation[], number | void>({
      query: (limit) => `/recommendations${limit ? `?limit=${limit}` : ''}`,
      providesTags: ['Reco'],
    }),
    favorites: build.query<Item[], void>({
      query: () => '/interactions/favorites',
      providesTags: ['Favorites'],
    }),
    history: build.query<(Interaction & { item: Item })[], void>({
      query: () => '/interactions/history',
      providesTags: ['History'],
    }),
    interact: build.mutation<Interaction, InteractionDto>({
      query: (body) => ({ url: '/interactions', method: 'POST', body }),
      invalidatesTags: ['Favorites', 'History', 'Reco', 'Home'],
    }),

    health: build.query<HealthReport, void>({ query: () => '/health' }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useHomeQuery,
  useItemsQuery,
  useItemQuery,
  useLazyItemSourceQuery,
  useSearchQuery,
  useUpcomingQuery,
  useRecommendationsQuery,
  useFavoritesQuery,
  useHistoryQuery,
  useInteractMutation,
  useHealthQuery,
} = api;
