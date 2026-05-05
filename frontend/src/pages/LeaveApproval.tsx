import { useState } from 'react';
import { Check, ClipboardCheck, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '../auth/AuthContext';
import { UserRole, userRoleLabel } from '../enums/UserRole';
import type { LeaveRequest } from '../types/api';
import {
  useApproveLeaveMutation,
  useListPendingLeavesQuery,
  useRejectLeaveMutation,
} from '../store/leaves.api';
import { runMutation } from '../lib/runMutation';

type Action = 'approve' | 'reject';

export function LeaveApprovalPage() {
  const { user } = useAuth();
  const isHR = user?.role.name === UserRole.HR;

  // /pending is parent-scoped server-side — works for both Manager and HR.
  const { data: list = [], isLoading } = useListPendingLeavesQuery();

  const [approve, { isLoading: approving }] = useApproveLeaveMutation();
  const [reject, { isLoading: rejecting }] = useRejectLeaveMutation();
  const submitting = approving || rejecting;

  const [dialog, setDialog] = useState<{
    leave: LeaveRequest;
    action: Action;
  } | null>(null);
  const [remark, setRemark] = useState('');

  const open = (leave: LeaveRequest, action: Action) => {
    setDialog({ leave, action });
    setRemark('');
  };
  const close = () => {
    setDialog(null);
    setRemark('');
  };

  const submit = async () => {
    if (!dialog || !remark.trim()) return;
    const fn = dialog.action === 'approve' ? approve : reject;
    if (
      await runMutation(fn({ id: dialog.leave.id, remark }), {
        success: dialog.action === 'approve' ? 'Approved' : 'Rejected',
        error: 'Action failed',
      })
    ) {
      close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Leave Approval
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review pending requests and approve or reject with a remark.
        </p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">All caught up</p>
              <p className="text-xs text-muted-foreground mt-1">
                No pending requests to review.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                {isHR && <TableHead>Role</TableHead>}
                <TableHead>Leave type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.requester?.username || `User ${r.userId}`}
                  </TableCell>
                  {isHR && (
                    <TableCell>
                      {r.requester?.role && (
                        <Badge variant="secondary">
                          {userRoleLabel(r.requester.role.name)}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {r.leaveType?.name || `Type ${r.leaveTypeId}`}
                  </TableCell>
                  <TableCell>{r.startDate}</TableCell>
                  <TableCell>{r.endDate}</TableCell>
                  <TableCell
                    className="max-w-[240px] truncate"
                    title={r.reason}
                  >
                    {r.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => open(r, 'approve')}
                      title="Approve"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => open(r, 'reject')}
                      title="Reject"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog
        open={!!dialog}
        onOpenChange={(o) => {
          if (!o) close();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog?.action === 'approve' ? 'Approve' : 'Reject'} leave
              request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Provide a remark before{' '}
              {dialog?.action === 'approve' ? 'approving' : 'rejecting'} this
              request.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dialog && (
            <div className="text-sm space-y-1 rounded-md border p-3 bg-muted/30">
              <div>
                <span className="text-muted-foreground">Requester: </span>
                <span className="font-medium">
                  {dialog.leave.requester?.username}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Dates: </span>
                {dialog.leave.startDate} → {dialog.leave.endDate}
              </div>
              <div>
                <span className="text-muted-foreground">Reason: </span>
                {dialog.leave.reason}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="remark">Remark (required)</Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              autoFocus
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submit}
              disabled={submitting || !remark.trim()}
              className={
                dialog?.action === 'reject'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dialog?.action === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
