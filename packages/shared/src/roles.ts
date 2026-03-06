export type UserRole = 'MANAGER' | 'SCHEDULER' | 'VIEWER';

export const ROLE_PERMISSIONS = {
  canMutate: (role: UserRole) => role === 'MANAGER' || role === 'SCHEDULER',
  isManager: (role: UserRole) => role === 'MANAGER',
} as const;
