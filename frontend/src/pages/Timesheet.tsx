import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timesheet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily attendance with hours worked.
        </p>
      </div>

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
        <div className="flex justify-center mt-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No records yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Attendance entries will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
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
                  <TableCell>{r.date}</TableCell>
                  {showUserCol && (
                    <TableCell>
                      {r.user?.username || `User ${r.userId}`}
                    </TableCell>
                  )}
                  <TableCell>{formatTime(r.checkIn)}</TableCell>
                  <TableCell>{formatTime(r.checkOut)}</TableCell>
                  <TableCell className="text-right">
                    {formatHours(r.hoursWorked)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
