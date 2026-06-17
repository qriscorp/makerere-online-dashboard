import { useState, useEffect } from "react";
import { Loader2, Wallet, TrendingUp, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";

import { api } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { EntityViewDialog } from "@/components/dashboard/entity-view-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { TableRowActions } from "@/components/dashboard/table-row-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentRecord {
  id: string;
  student_id: string;
  enrollment_id: string | null;
  amount: number;
  currency: string;
  phone_number: string;
  carrier: string;
  payment_type: string;
  status: string;
  request_reference: string | null;
  response_message: string | null;
  description: string;
  created_at: string;
  completed_at: string | null;
}

interface SystemWalletData {
  balance: number;
  currency: string;
  total_received: number;
  total_withdrawn: number;
}

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

function getStatusBadge(status: string) {
  return (
    <Badge
      variant={
        status === "completed"
          ? "default"
          : status === "pending" || status === "processing"
            ? "secondary"
            : "destructive"
      }
    >
      {status}
    </Badge>
  );
}

export default function DashboardPayments() {
  const { user } = useAuth();

  if (user.role === "super_admin") return <SuperAdminPayments />;
  if (user.role === "admin") return <AdminPayments />;
  if (user.role === "lecturer") return <LecturerPayments />;
  return <StudentPayments />;
}

// ─── Super Admin — System Wallet + All Payments ──────────────────────────────

function SuperAdminPayments() {
  const [wallet, setWallet] = useState<SystemWalletData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletData, paymentsData] = await Promise.all([
        api.getSystemWallet(),
        api.getPayments(),
      ]);
      setWallet(walletData);
      setPayments(paymentsData as PaymentRecord[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load payment data";
      notify.error("Failed to load payments", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Wallet & Payments"
        description="Overview of all payments and the system wallet."
      />

      {wallet && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Wallet Balance</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.balance)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-medium">Total Received</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_received)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-orange-600">
              <ArrowDownCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Total Withdrawn</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_withdrawn)}</p>
          </div>
        </div>
      )}

      <PaymentsTable
        payments={payments}
        canManage
        isSuperAdmin
        onRefresh={loadData}
      />
    </div>
  );
}

// ─── Admin — All Payments ────────────────────────────────────────────────────

function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getPayments();
      setPayments(data as PaymentRecord[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load payments";
      notify.error("Failed to load payments", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Payments"
        description="View and manage all payment transactions."
      />
      <PaymentsTable payments={payments} canManage onRefresh={loadData} />
    </div>
  );
}

// ─── Lecturer — Their Wallet + Payments received ─────────────────────────────

function LecturerPayments() {
  const [wallet, setWallet] = useState<{
    balance: number;
    currency: string;
    total_earned: number;
  } | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getLecturerWallet(), api.getPayments()])
      .then(([w, p]) => {
        setWallet(w);
        setPayments(p as PaymentRecord[]);
      })
      .catch(() => notify.error("Failed to load payment data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wallet"
        description="Track payments received from tutoring sessions."
      />

      {wallet && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Wallet Balance</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.balance)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-medium">Total Earned</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatUGX(wallet.total_earned)}</p>
          </div>
        </div>
      )}

      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Student — Their payment history ─────────────────────────────────────────

function StudentPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPayments()
      .then((data) => setPayments(data as PaymentRecord[]))
      .catch(() => notify.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payments"
        description="Your payment history for courses and tutoring."
      />
      <PaymentsTable payments={payments} />
    </div>
  );
}

// ─── Shared Payments Table ───────────────────────────────────────────────────

function PaymentsTable({
  payments,
  canManage = false,
  isSuperAdmin = false,
  onRefresh,
}: {
  payments: PaymentRecord[];
  canManage?: boolean;
  isSuperAdmin?: boolean;
  onRefresh?: () => Promise<void>;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewing, setViewing] = useState<PaymentRecord | null>(null);
  const [editing, setEditing] = useState<PaymentRecord | null>(null);
  const [deleting, setDeleting] = useState<PaymentRecord | null>(null);
  const [formStatus, setFormStatus] = useState("completed");
  const [submitting, setSubmitting] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const openView = (payment: PaymentRecord) => {
    setViewing(payment);
    setViewOpen(true);
  };

  const openEdit = (payment: PaymentRecord) => {
    setEditing(payment);
    setFormStatus(payment.status);
    setFormOpen(true);
  };

  const openDelete = (payment: PaymentRecord) => {
    setDeleting(payment);
    setDeleteOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSubmitting(true);
      await api.updatePayment(editing.id, { status: formStatus });
      notify.success("Payment updated successfully");
      setFormOpen(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update payment";
      notify.error("Failed to update payment", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setDeletingLoading(true);
      await api.deletePayment(deleting.id);
      notify.success("Payment deleted successfully");
      setDeleteOpen(false);
      setDeleting(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete payment";
      notify.error("Failed to delete payment", { description: message });
    } finally {
      setDeletingLoading(false);
    }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: "description",
      header: "Description",
      render: (row) => {
        const p = row as unknown as PaymentRecord;
        return (
          <div>
            <p className="text-sm font-medium">{p.description}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {p.payment_type.replace("_", " ")}
            </p>
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-medium">
          {formatUGX((row as unknown as PaymentRecord).amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge((row as unknown as PaymentRecord).status),
    },
    {
      key: "carrier",
      header: "Carrier",
      render: (row) => (
        <span className="text-sm uppercase">
          {(row as unknown as PaymentRecord).carrier}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (row) => {
        try {
          return (
            <span className="text-sm">
              {format(
                new Date((row as unknown as PaymentRecord).created_at),
                "MMM d, yyyy",
              )}
            </span>
          );
        } catch {
          return <span className="text-sm">—</span>;
        }
      },
    },
    {
      key: "request_reference",
      header: "Reference",
      render: (row) => (
        <span className="font-mono text-xs">
          {(row as unknown as PaymentRecord).request_reference || "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={payments as unknown as Record<string, unknown>[]}
          searchableFields={["description"]}
          searchPlaceholder="Search payments..."
          emptyMessage="No payments found."
          rowActions={
            canManage
              ? (row) => {
                  const payment = row as unknown as PaymentRecord;
                  return (
                    <TableRowActions
                      onView={() => openView(payment)}
                      onEdit={() => openEdit(payment)}
                      onDelete={() => openDelete(payment)}
                      showDelete={isSuperAdmin}
                    />
                  );
                }
              : undefined
          }
        />
      </div>

      <EntityViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Payment details"
        fields={
          viewing
            ? [
                { label: "Description", value: viewing.description },
                { label: "Amount", value: formatUGX(viewing.amount) },
                { label: "Status", value: getStatusBadge(viewing.status) },
                { label: "Phone", value: viewing.phone_number },
                { label: "Carrier", value: viewing.carrier.toUpperCase() },
                { label: "Type", value: viewing.payment_type },
                {
                  label: "Reference",
                  value: viewing.request_reference || "—",
                },
                {
                  label: "Date",
                  value: format(new Date(viewing.created_at), "MMM d, yyyy HH:mm"),
                },
              ]
            : []
        }
      />

      {canManage && (
        <>
          <EntityFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            title="Edit Payment"
            description="Update payment status."
            onSubmit={handleUpdate}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {submitting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </EntityFormDialog>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Payment"
            description={`Delete payment "${deleting?.description}"? This cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={handleDelete}
            loading={deletingLoading}
            destructive
          />
        </>
      )}
    </>
  );
}
