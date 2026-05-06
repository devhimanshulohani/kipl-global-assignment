import { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  useGetTodayQuery,
  useCheckInMutation,
  useCheckOutMutation,
} from '../store/attendance.api';
import { formatDate, formatHours, formatTime } from '../lib/dates';
import { Page } from '../components/Page';
import { Loading } from '../components/Loading';

export function AttendancePage() {
  const { data: today, isLoading } = useGetTodayQuery();
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();
  const [error, setError] = useState<string | null>(null);

  const submitting = checkingIn || checkingOut;

  const onCheckIn = async () => {
    setError(null);
    try {
      await checkIn().unwrap();
    } catch (err: any) {
      setError(err.data?.message || 'Check-in failed');
    }
  };

  const onCheckOut = async () => {
    setError(null);
    try {
      await checkOut().unwrap();
    } catch (err: any) {
      setError(err.data?.message || 'Check-out failed');
    }
  };

  if (isLoading) return <Loading />;

  const status = !today
    ? { label: 'Not checked in', variant: 'outline' as const }
    : !today.checkOut
      ? { label: 'Checked in', variant: 'default' as const }
      : { label: 'Day complete', variant: 'secondary' as const };

  return (
    <Page
      title="Check-in / Check-out"
      description="Mark your attendance for today."
    >
      <div className="max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
            <CardDescription>
              {formatDate(new Date().toISOString())}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Row label="Check-in" value={formatTime(today?.checkIn)} />
            <Row label="Check-out" value={formatTime(today?.checkOut)} />
            <Row label="Hours worked" value={formatHours(today?.hoursWorked)} />
            <div className="pt-1">
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={onCheckIn}
            disabled={submitting || !!today}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Check In
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCheckOut}
            disabled={submitting || !today || !!today.checkOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        </div>
      </div>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
