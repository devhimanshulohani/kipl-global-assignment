import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Permission } from './permissions';

export function RequirePermission({
  permissions,
}: {
  permissions: Permission[];
}) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const granted = new Set(user.permissions);
  const ok = permissions.every((p) => granted.has(p));
  if (!ok) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}
