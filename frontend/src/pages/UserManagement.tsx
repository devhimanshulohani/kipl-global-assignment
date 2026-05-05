import { useState } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { UserRole, userRoleLabel } from '../enums/UserRole';
import {
  useCreateUserMutation,
  useListUsersQuery,
  useUpdateUserMutation,
} from '../store/users.api';
import type { UserRow } from '../store/users.api';
import { runMutation } from '../lib/runMutation';
import { useAuth } from '../auth/AuthContext';

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, error } = useListUsersQuery();

  // Backend strips the caller from /api/users so they don't appear in the
  // table. For the parent dropdown + "Reports to" lookup we still need
  // them as an assignable parent, so re-merge here.
  const allUsers: UserRow[] = currentUser
    ? [
        {
          id: currentUser.id,
          username: currentUser.username,
          role: currentUser.role,
          parentId: null,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
        ...users,
      ]
    : users;
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const submitting = creating || updating;

  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.Employee);
  const [newParentId, setNewParentId] = useState<string>('');

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.Employee);
  const [editParentId, setEditParentId] = useState<string>('');
  const [editActive, setEditActive] = useState(true);

  // Restrict parent dropdown to valid roles (server-validated in users.service.validateParent).
  const parentRoleFor = (childRole: UserRole): UserRole | null => {
    if (childRole === UserRole.Employee) return UserRole.Manager;
    if (childRole === UserRole.Manager) return UserRole.HR;
    return null;
  };
  const parentOptionsFor = (childRole: UserRole, excludeId?: number) => {
    const r = parentRoleFor(childRole);
    if (r === null) return [];
    return allUsers.filter(
      (u) => u.role.name === r && u.isActive && u.id !== excludeId
    );
  };
  const findUser = (id: number | null) =>
    id == null ? undefined : allUsers.find((u) => u.id === id);

  const openCreate = () => {
    setNewUsername('');
    setNewPassword('');
    setNewRole(UserRole.Employee);
    setNewParentId('');
    setCreateOpen(true);
  };

  const onCreate = async () => {
    // Manager auto-reports to the HR creating them; only Employee picks a parent.
    const parentId =
      newRole === UserRole.Manager
        ? (currentUser?.id ?? null)
        : newParentId
          ? Number(newParentId)
          : null;
    if (
      await runMutation(
        createUser({
          username: newUsername,
          password: newPassword,
          role: newRole,
          parentId,
        }),
        { success: 'User created', error: 'Create failed' }
      )
    ) {
      setCreateOpen(false);
    }
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setEditRole(u.role.name);
    setEditParentId(u.parentId == null ? '' : String(u.parentId));
    setEditActive(u.isActive);
  };

  const onSave = async () => {
    if (!editing) return;
    // Same rule as create: Manager parent is the HR doing the editing,
    // Employee picks one, HR has none.
    const parentId =
      editRole === UserRole.Manager
        ? (currentUser?.id ?? null)
        : editRole === UserRole.HR
          ? null
          : editParentId
            ? Number(editParentId)
            : null;
    if (
      await runMutation(
        updateUser({
          id: editing.id,
          role: editRole,
          parentId,
          isActive: editActive,
        }),
        { success: 'User updated', error: 'Update failed' }
      )
    ) {
      setEditing(null);
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
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create users, assign roles and reporting managers, deactivate accounts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {!!error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load users</AlertDescription>
        </Alert>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Reports to</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {userRoleLabel(u.role.name)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {findUser(u.parentId)?.username ||
                    (u.parentId ? `User ${u.parentId}` : '—')}
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? 'default' : 'outline'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(u)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => {
                  setNewRole(v as UserRole);
                  // Different role → different valid parent role; reset.
                  setNewParentId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.Employee}>
                    {userRoleLabel(UserRole.Employee)}
                  </SelectItem>
                  <SelectItem value={UserRole.Manager}>
                    {userRoleLabel(UserRole.Manager)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === UserRole.Employee ? (
              <div className="space-y-2">
                <Label>Reporting manager</Label>
                <Select value={newParentId} onValueChange={setNewParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptionsFor(newRole).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Reporting HR</Label>
                <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
                  {currentUser?.username ?? '—'}{' '}
                  <span className="text-xs">(you)</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onCreate}
              disabled={
                submitting ||
                !newUsername.trim() ||
                newPassword.length < 8 ||
                (newRole === UserRole.Employee && !newParentId)
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editing?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editRole}
                onValueChange={(v) => {
                  setEditRole(v as UserRole);
                  setEditParentId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.Employee}>
                    {userRoleLabel(UserRole.Employee)}
                  </SelectItem>
                  <SelectItem value={UserRole.Manager}>
                    {userRoleLabel(UserRole.Manager)}
                  </SelectItem>
                  <SelectItem value={UserRole.HR}>
                    {userRoleLabel(UserRole.HR)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editRole === UserRole.Employee && (
              <div className="space-y-2">
                <Label>Reporting manager</Label>
                <Select value={editParentId} onValueChange={setEditParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptionsFor(editRole, editing?.id).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editRole === UserRole.Manager && (
              <div className="space-y-2">
                <Label>Reporting HR</Label>
                <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
                  {currentUser?.username ?? '—'}{' '}
                  <span className="text-xs">(you, on save)</span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Switch
                checked={editActive}
                onCheckedChange={setEditActive}
                id="edit-active"
              />
              <Label htmlFor="edit-active">
                {editActive ? 'Active' : 'Deactivated'}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={
                submitting ||
                (editRole === UserRole.Employee && !editParentId)
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
