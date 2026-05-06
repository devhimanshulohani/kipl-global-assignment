import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '../auth/permissions';
import { useListAttendanceQuery } from '../store/attendance.api';
import { formatHours, formatTime } from '../lib/dates';
import { Page } from '../components/Page';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

type Scope = 'me' | 'team' | 'all';

export function TimesheetPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>('me');
  const { data: records = [], isLoading, error } =
    useListAttendanceQuery(scope);

  const perms = new Set(user?.permissions ?? []);
  const showAll = perms.has(PERMISSIONS.ATTENDANCE_READ_ALL);
  // HR has both perms — show single "Organization" tab, not duplicate "My team".
  const showTeam = perms.has(PERMISSIONS.ATTENDANCE_READ_TEAM) && !showAll;
  const showUserCol = scope !== 'me';

  return (
    <Page title="Timesheet" description="Daily attendance with hours worked.">
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList>
          <TabsTrigger value="me">My attendance</TabsTrigger>
          {showTeam && <TabsTrigger value="team">My team</TabsTrigger>}
          {showAll && <TabsTrigger value="all">Organization</TabsTrigger>}
        </TabsList>
      </Tabs>

      {!!error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load timesheet</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Loading />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No records yet"
          description="Attendance entries will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showUserCol && <TableHead>User</TableHead>}
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead className="text-right">Hours worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  {showUserCol && (
                    <TableCell>
                      {r.user?.username || `User ${r.userId}`}
                    </TableCell>
                  )}
                  <TableCell>{formatTime(r.checkIn)}</TableCell>
                  <TableCell>{formatTime(r.checkOut)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatHours(r.hoursWorked)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Page>
  );
}
