import { useState } from 'react';
import { Loader2, LogIn, LogOut } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center mt-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = !today
    ? { label: 'Not checked in', variant: 'outline' as const }
    : !today.checkOut
      ? { label: 'Checked in', variant: 'default' as const }
      : { label: 'Day complete', variant: 'secondary' as const };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Check-in / Check-out
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mark your attendance for today.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Today's status</CardTitle>
          <CardDescription>
            {formatDate(new Date().toISOString())}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span className="font-medium">{formatTime(today?.checkIn)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span className="font-medium">{formatTime(today?.checkOut)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hours worked</span>
            <span className="font-medium">
              {formatHours(today?.hoursWorked)}
            </span>
          </div>
          <div className="pt-1">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 max-w-xl">
        <Button
          size="lg"
          className="flex-1"
          onClick={onCheckIn}
          disabled={submitting || !!today}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </Button>
        <Button
          size="lg"
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
  );
}
