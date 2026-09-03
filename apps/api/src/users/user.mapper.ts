import type { User } from '@prisma/client';
import type { Category, PublicUser, UserPreferences } from '@view/shared';
import { CATEGORIES, isCategory } from '@view/shared';

export function parsePreferences(json: string, matchNotifications: boolean): UserPreferences {
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(json) ?? {};
  } catch {
    raw = {};
  }
  const favoriteCategories = Array.isArray(raw.favoriteCategories)
    ? (raw.favoriteCategories.filter(isCategory) as Category[])
    : [];
  const favoriteGenres = Array.isArray(raw.favoriteGenres)
    ? (raw.favoriteGenres.filter((g): g is string => typeof g === 'string').slice(0, 20))
    : [];
  return {
    favoriteCategories: favoriteCategories.length
      ? favoriteCategories
      : ([...CATEGORIES] as Category[]),
    favoriteGenres,
    matchNotifications,
  };
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
    preferences: parsePreferences(user.preferenceJson, user.matchNotifications),
  };
}
