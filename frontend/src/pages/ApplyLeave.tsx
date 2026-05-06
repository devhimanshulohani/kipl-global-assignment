import { useState } from 'react';
import type { FormEvent } from 'react';
import { Inbox, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LeaveStatus, leaveStatusLabel } from '../enums/LeaveStatus';
import { useListLeaveTypesQuery } from '../store/leaveTypes.api';
import {
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useListMyLeavesQuery,
} from '../store/leaves.api';
import { runMutation } from '../lib/runMutation';
import { Page } from '../components/Page';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';

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
  const { data: list = [], isLoading: listLoading } = useListMyLeavesQuery();
  const [applyLeave, { isLoading: submitting }] = useApplyLeaveMutation();
  const [cancelLeave] = useCancelLeaveMutation();

  const [open, setOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setLeaveTypeId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setError(null);
  };

  const openApply = () => {
    resetForm();
    setOpen(true);
  };

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
      resetForm();
      setOpen(false);
    } catch (err: any) {
      setError(err.data?.message || 'Submit failed');
    }
  };

  const onCancel = (id: number) =>
    runMutation(cancelLeave(id), {
      success: 'Cancelled',
      error: 'Cancel failed',
    });

  if (typesLoading || listLoading) return <Loading />;

  return (
    <Page
      title="My Leaves"
      description="Past requests, status, and remarks. Submit a new request from here."
      action={
        <Button onClick={openApply}>
          <Plus className="h-4 w-4 mr-2" />
          Apply for leave
        </Button>
      }
    >
      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-5 w-5" />}
          title="No requests yet"
          description="Your submitted leaves will appear here."
          action={
            <Button onClick={openApply}>
              <Plus className="h-4 w-4 mr-2" />
              Apply for leave
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
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
                  <TableCell className="font-medium">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
          </DialogHeader>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !leaveTypeId || !startDate || !endDate}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
