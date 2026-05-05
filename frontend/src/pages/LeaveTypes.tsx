import { useState } from 'react';
import { Loader2, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { LeaveType } from '../types/api';
import {
  useCreateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useListLeaveTypesQuery,
  useUpdateLeaveTypeMutation,
} from '../store/leaveTypes.api';
import { runMutation } from '../lib/runMutation';

export function LeaveTypesPage() {
  const { data: list = [], isLoading, error } = useListLeaveTypesQuery();
  const [createLeaveType, { isLoading: creating }] =
    useCreateLeaveTypeMutation();
  const [updateLeaveType, { isLoading: updating }] =
    useUpdateLeaveTypeMutation();
  const [deleteLeaveType, { isLoading: deleting }] =
    useDeleteLeaveTypeMutation();
  const submitting = creating || updating || deleting;

  const [dialog, setDialog] = useState<{ id?: number } | null>(null);
  const [name, setName] = useState('');
  const [quota, setQuota] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openCreate = () => {
    setDialog({});
    setName('');
    setQuota('');
  };
  const openEdit = (t: LeaveType) => {
    setDialog({ id: t.id });
    setName(t.name);
    setQuota(String(t.annualQuota));
  };
  const close = () => {
    setDialog(null);
    setName('');
    setQuota('');
  };

  const onSave = async () => {
    const payload = { name: name.trim(), annualQuota: Number(quota) };
    if (
      await runMutation(
        dialog?.id
          ? updateLeaveType({ id: dialog.id, ...payload })
          : createLeaveType(payload),
        { success: dialog?.id ? 'Updated' : 'Created', error: 'Save failed' }
      )
    ) {
      close();
    }
  };

  const onDelete = async () => {
    if (deleteId == null) return;
    if (
      await runMutation(deleteLeaveType(deleteId), {
        success: 'Deleted',
        error: 'Delete failed (likely referenced by an existing request)',
      })
    ) {
      setDeleteId(null);
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
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define leave types available to all employees.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Type
        </Button>
      </div>

      {!!error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load leave types</AlertDescription>
        </Alert>
      )}

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Tags className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No leave types yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Leave Type" to create one.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">
                  Annual quota (days)
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="text-right">
                    {t.annualQuota}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(t)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(t.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={!!dialog}
        onOpenChange={(o) => {
          if (!o) close();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog?.id ? 'Edit Leave Type' : 'Add Leave Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lt-name">Name</Label>
              <Input
                id="lt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lt-quota">Annual quota (days)</Label>
              <Input
                id="lt-quota"
                type="number"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={
                submitting ||
                !name.trim() ||
                quota === '' ||
                Number(quota) < 0
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dialog?.id ? (
                'Save'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete leave type?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing requests referencing this type will block deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
