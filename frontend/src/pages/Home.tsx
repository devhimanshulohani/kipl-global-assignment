import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '../auth/AuthContext';
import { userRoleLabel } from '../enums/UserRole';

export function HomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {user.username}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Signed in as {userRoleLabel(user.role.name)}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick start</CardTitle>
          <CardDescription>
            Use the sidebar to navigate to the actions available for your role.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
