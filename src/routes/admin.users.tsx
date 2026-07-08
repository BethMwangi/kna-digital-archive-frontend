import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — KNA Admin" }] }),
  component: AdminUsers,
});

const roles = ["Customer", "Content Editor", "Administrator", "Super Administrator"] as const;
const users = [
  { name: "Wanjiku Kamau", email: "wanjiku@example.co.ke", role: "Customer", status: "Active", orders: 18 },
  { name: "John Muthoni", email: "j.muthoni@kna.go.ke", role: "Super Administrator", status: "Active", orders: 0 },
  { name: "Amina Yusuf", email: "a.yusuf@kna.go.ke", role: "Content Editor", status: "Active", orders: 0 },
  { name: "Peter Otieno", email: "p.otieno@nation.co.ke", role: "Customer", status: "Suspended", orders: 4 },
  { name: "Grace Njeri", email: "grace@researchlab.ac.ke", role: "Customer", status: "Active", orders: 27 },
  { name: "Kevin Mwangi", email: "k.mwangi@kna.go.ke", role: "Administrator", status: "Active", orders: 0 },
];

function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Accounts</p>
          <h1 className="mt-2 font-display text-4xl">Users</h1>
        </div>
        <InviteDialog />
      </div>

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-ink text-paper grid place-items-center text-xs font-medium">
                      {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[0.65rem] uppercase tracking-wider">{u.role}</Badge></TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs",
                    u.status === "Active" ? "text-[oklch(0.35_0.14_150)]" : "text-flag-red")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", u.status === "Active" ? "bg-[oklch(0.55_0.14_150)]" : "bg-flag-red")} />
                    {u.status}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">{u.orders}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90"><UserPlus className="mr-1.5 h-3 w-3" /> Invite staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Invite staff member</DialogTitle>
          <DialogDescription>They'll receive an email to set up their account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>First name</Label><Input className="mt-1.5" /></div>
            <div><Label>Last name</Label><Input className="mt-1.5" /></div>
          </div>
          <div><Label>Work email</Label><Input type="email" className="mt-1.5" placeholder="name@kna.go.ke" /></div>
          <div>
            <Label>Role</Label>
            <Select defaultValue="Content Editor">
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.filter((r) => r !== "Customer").map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="rounded-none bg-ink text-paper hover:bg-ink/90">Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
