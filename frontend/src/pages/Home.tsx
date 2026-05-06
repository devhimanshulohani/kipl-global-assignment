import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '../auth/AuthContext';
import { userRoleLabel } from '../enums/UserRole';
import { Page } from '../components/Page';

export function HomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Page
      title={`Welcome, ${user.username}`}
      description={`Signed in as ${userRoleLabel(user.role.name)}.`}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick start</CardTitle>
          <CardDescription>
            Use the sidebar to navigate to the actions available for your role.
          </CardDescription>
        </CardHeader>
      </Card>
    </Page>
  );
}
