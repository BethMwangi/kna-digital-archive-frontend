import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneField } from "@/components/kna/phone-field";
import { UserPlus, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/use-auth";
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser } from "@/hooks/use-admin-users";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  type AdminUserCreateFormValues,
  type AdminUserUpdateFormValues,
} from "@/lib/validation/auth";
import { applyApiErrorToForm } from "@/lib/api/form-errors";
import type { AccountStatus, Role, User } from "@/lib/api/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Urithi Admin" }] }),
  component: AdminUsers,
});

const roleLabels: Record<Role, string> = {
  customer: "Customer",
  content_editor: "Content Editor",
  admin: "Administrator",
  super_admin: "Super Administrator",
};

const invitableRoles: Role[] = ["content_editor", "admin", "super_admin"];

/** AdminUserViewSet's raw DRF payload doesn't include full_name (unlike the enveloped UserSerializer profile/login use), so derive it. */
function displayName(user: Pick<User, "full_name" | "first_name" | "last_name">): string {
  return user.full_name || `${user.first_name} ${user.last_name}`.trim();
}

function AdminUsers() {
  const { isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<AccountStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, role, status]);

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role: role === "all" ? undefined : role,
    account_status: status === "all" ? undefined : status,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1 className="mt-2 font-display text-4xl">Users</h1>
        </div>
        <InviteDialog canAssignAdminRoles={isSuperAdmin} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={(v) => setRole(v as Role | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {(Object.keys(roleLabels) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabels[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle className="text-sm">Couldn't load users</AlertTitle>
          <AlertDescription className="text-xs">
            Check that the API is running and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-ink text-paper grid place-items-center text-xs font-medium">
                      {displayName(u)
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayName(u)}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[0.65rem] uppercase tracking-wider">
                    {roleLabels[u.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs",
                      u.account_status === "active"
                        ? "text-[oklch(0.35_0.14_150)]"
                        : "text-flag-red",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        u.account_status === "active" ? "bg-[oklch(0.55_0.14_150)]" : "bg-flag-red",
                      )}
                    />
                    {u.account_status === "active" ? "Active" : "Suspended"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <RowActions user={u} canAssignAdminRoles={isSuperAdmin} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (data.next || data.previous) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.count} total</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.next}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RowActions({ user, canAssignAdminRoles }: { user: User; canAssignAdminRoles: boolean }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateUser = useUpdateAdminUser();

  const toggleStatus = () => {
    updateUser.mutate({
      id: user.id,
      input: { account_status: user.account_status === "active" ? "suspended" : "active" },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleStatus} disabled={updateUser.isPending}>
            {user.account_status === "active" ? "Suspend" : "Reactivate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        canAssignAdminRoles={canAssignAdminRoles}
      />
    </>
  );
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
  canAssignAdminRoles,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAssignAdminRoles: boolean;
}) {
  const updateUser = useUpdateAdminUser();
  const [formError, setFormError] = useState("");

  const form = useForm<AdminUserUpdateFormValues>({
    resolver: zodResolver(adminUserUpdateSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role: user.role,
      account_status: user.account_status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        role: user.role,
        account_status: user.account_status,
      });
      setFormError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    updateUser.mutate(
      { id: user.id, input: values },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
      },
    );
  });

  const availableRoles: Role[] = canAssignAdminRoles
    ? (Object.keys(roleLabels) as Role[])
    : (Object.keys(roleLabels) as Role[]).filter((r) => r !== "admin" && r !== "super_admin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit {displayName(user)}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <PhoneField control={form.control} name="phone_number" label="Phone" />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-ink text-paper hover:bg-ink/90"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({ canAssignAdminRoles }: { canAssignAdminRoles: boolean }) {
  const [open, setOpen] = useState(false);
  const createUser = useCreateAdminUser();
  const [formError, setFormError] = useState("");

  const roleOptions = canAssignAdminRoles
    ? invitableRoles
    : invitableRoles.filter((r) => r === "content_editor");

  const form = useForm<AdminUserCreateFormValues>({
    resolver: zodResolver(adminUserCreateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: roleOptions[0],
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    createUser.mutate(
      { ...values, password: values.password || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset({
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            role: roleOptions[0],
            password: "",
          });
        },
        onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90">
          <UserPlus className="mr-1.5 h-3 w-3" /> Invite staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Invite staff member</DialogTitle>
          <DialogDescription>
            No invite email is sent yet — set a temporary password here and share it with them
            directly, or leave it blank to let the system generate one (in which case you'll need a
            "forgot password" flow to hand off access).
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@urithi.co.ke" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PhoneField control={form.control} name="phone_number" />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary password (optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Leave blank to auto-generate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-ink text-paper hover:bg-ink/90"
                disabled={createUser.isPending}
              >
                {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
