import { useState } from 'react';
import { Check, ClipboardCheck, Loader2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Page } from '../components/Page';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
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
import { LeaveStatus, leaveStatusLabel } from '../enums/LeaveStatus';
import type { LeaveRequest } from '../types/api';
import {
  useApproveLeaveMutation,
  useListAllLeavesQuery,
  useListPendingLeavesQuery,
  useListTeamLeavesQuery,
  useRejectLeaveMutation,
} from '../store/leaves.api';
import { runMutation } from '../lib/runMutation';

type Action = 'approve' | 'reject';
type Tab = 'pending' | 'all';

const statusVariant = (
  s: LeaveStatus
): 'default' | 'destructive' | 'outline' =>
  s === LeaveStatus.Approved
    ? 'default'
    : s === LeaveStatus.Rejected
      ? 'destructive'
      : 'outline';

export function LeaveApprovalPage() {
  const { user } = useAuth();
  const isHR = user?.role.name === UserRole.HR;
  const [tab, setTab] = useState<Tab>('pending');

  // All three queries are declared but only the active one runs (skip flag).
  const { data: pending = [], isLoading: pendingLoading } =
    useListPendingLeavesQuery(undefined, { skip: tab !== 'pending' });
  const { data: team = [], isLoading: teamLoading } = useListTeamLeavesQuery(
    undefined,
    { skip: tab !== 'all' || isHR }
  );
  const { data: all = [], isLoading: allLoading } = useListAllLeavesQuery(
    undefined,
    { skip: tab !== 'all' || !isHR }
  );

  const list: LeaveRequest[] =
    tab === 'pending' ? pending : isHR ? all : team;
  const isLoading = pendingLoading || teamLoading || allLoading;

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

  const showStatus = tab === 'all';
  const allTabLabel = isHR ? 'All organization' : 'All my team';

  return (
    <Page
      title="Leave Approval"
      description={
        tab === 'pending'
          ? 'Review pending requests and approve or reject with a remark.'
          : isHR
            ? 'All leave requests across the organization.'
            : 'Full history of leave requests from your reportees.'
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="all">{allTabLabel}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title={tab === 'pending' ? 'All caught up' : 'No leave requests'}
          description={
            tab === 'pending'
              ? 'No pending requests to review.'
              : 'Nothing to show here yet.'
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                {isHR && <TableHead>Role</TableHead>}
                <TableHead>Leave type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Reason</TableHead>
                {showStatus && <TableHead>Status</TableHead>}
                {showStatus && <TableHead>Remark</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
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
                  {showStatus && (
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>
                        {leaveStatusLabel(r.status)}
                      </Badge>
                    </TableCell>
                  )}
                  {showStatus && (
                    <TableCell className="text-muted-foreground">
                      {r.remark || '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {r.status === LeaveStatus.Pending && (
                      <>
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
                      </>
                    )}
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
    </Page>
  );
}
