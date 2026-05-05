import { useState } from 'react';
import type { FormEvent } from 'react';
import { Inbox, Loader2, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { LeaveStatus, leaveStatusLabel } from '../enums/LeaveStatus';
import { useListLeaveTypesQuery } from '../store/leaveTypes.api';
import {
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useListMyLeavesQuery,
} from '../store/leaves.api';
import { runMutation } from '../lib/runMutation';

const statusVariant = (
  s: LeaveStatus
): 'default' | 'destructive' | 'outline' =>
  s === LeaveStatus.Approved
    ? 'default'
    : s === LeaveStatus.Rejected
      ? 'destructive'
      : 'outline';

export function ApplyLeavePage() {
  const { data: types = [], isLoading: typesLoading } =
    useListLeaveTypesQuery();
  const { data: list = [], isLoading: listLoading } =
    useListMyLeavesQuery();
  const [applyLeave, { isLoading: submitting }] = useApplyLeaveMutation();
  const [cancelLeave] = useCancelLeaveMutation();

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId) return;
    setError(null);
    try {
      await applyLeave({
        leaveTypeId: Number(leaveTypeId),
        startDate,
        endDate,
        reason,
      }).unwrap();
      toast.success('Leave request submitted');
      setLeaveTypeId('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err: any) {
      setError(err.data?.message || 'Submit failed');
    }
  };

  const onCancel = (id: number) =>
    runMutation(cancelLeave(id), {
      success: 'Cancelled',
      error: 'Cancel failed',
    });

  if (typesLoading || listLoading) {
    return (
      <div className="flex justify-center mt-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Apply for Leave
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a new request and track its status below.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New leave request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Leave type</Label>
              <Select
                value={leaveTypeId}
                onValueChange={setLeaveTypeId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a leave type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} ({t.annualQuota} days/year)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-base font-semibold mt-2">Your leave requests</h2>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your submitted leaves will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.leaveType?.name || `Type ${r.leaveTypeId}`}
                  </TableCell>
                  <TableCell>{r.startDate}</TableCell>
                  <TableCell>{r.endDate}</TableCell>
                  <TableCell
                    className="max-w-[220px] truncate"
                    title={r.reason}
                  >
                    {r.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)}>
                      {leaveStatusLabel(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.remark || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === LeaveStatus.Pending && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancel(r.id)}
                        title="Cancel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
