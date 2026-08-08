import { useEffect, useMemo } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../domain/enums/Igreja/voluntario-role.enum';

type AllowedRole = IgrejaVoluntarioRoleEnum | 'OWNER';

const DEFAULT_REDIRECT = '/(app)/(drawer)/inicio';

export function useRoleGuard(allowedRoles: AllowedRole[], redirectTo: string = DEFAULT_REDIRECT) {
  const { igrejaAtiva, loading } = useAuth();
  const router = useRouter();
  const navState = useRootNavigationState();

  const normalizedAllowedRoles = useMemo(
    () => allowedRoles.map((role) => role.toString().toUpperCase()),
    [allowedRoles],
  );

  const currentRole = igrejaAtiva?.role?.toString().toUpperCase() ?? null;
  const hasAccess = Boolean(currentRole && normalizedAllowedRoles.includes(currentRole));

  useEffect(() => {
    if (loading || !navState?.key) return;
    if (hasAccess) return;

    router.replace(redirectTo);
  }, [hasAccess, loading, navState?.key, redirectTo, router]);

  return { hasAccess, loading };
}
