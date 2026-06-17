import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";

import { api, type ApiTutorAdmin } from "@/lib/api";
import { notify } from "@/lib/notify";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { EntityViewDialog } from "@/components/dashboard/entity-view-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { TableRowActions } from "@/components/dashboard/table-row-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="border-transparent bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
  }
}

type TutorFormData = {
  subjects: string;
  hourly_rate: number;
  bio: string;
  is_available: boolean;
  approval_status: string;
};

export default function TutorManagement() {
  const { user } = useAuth();
  const isSuperAdmin = user.role === "super_admin";

  const [tutors, setTutors] = useState<ApiTutorAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewing, setViewing] = useState<ApiTutorAdmin | null>(null);
  const [editing, setEditing] = useState<ApiTutorAdmin | null>(null);
  const [deleting, setDeleting] = useState<ApiTutorAdmin | null>(null);
  const [formData, setFormData] = useState<TutorFormData>({
    subjects: "",
    hourly_rate: 50000,
    bio: "",
    is_available: true,
    approval_status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTutors();
      setTutors(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tutor profiles";
      notify.error("Failed to load tutors", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const openView = (tutor: ApiTutorAdmin) => {
    setViewing(tutor);
    setViewOpen(true);
  };

  const openEdit = (tutor: ApiTutorAdmin) => {
    setEditing(tutor);
    setFormData({
      subjects: tutor.subjects.join(", "),
      hourly_rate: tutor.hourly_rate,
      bio: tutor.bio,
      is_available: tutor.is_available,
      approval_status: tutor.approval_status,
    });
    setFormOpen(true);
  };

  const openDelete = (tutor: ApiTutorAdmin) => {
    setDeleting(tutor);
    setDeleteOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSubmitting(true);
      await api.updateTutor(editing.id, {
        subjects: formData.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hourly_rate: formData.hourly_rate,
        bio: formData.bio,
        is_available: formData.is_available,
        approval_status: formData.approval_status,
      });
      notify.success("Tutor profile updated successfully", {
        description: `${editing.name}'s profile has been updated.`,
      });
      setFormOpen(false);
      await fetchTutors();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update tutor";
      notify.error("Failed to update tutor", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setDeletingLoading(true);
      await api.deleteTutor(deleting.id);
      notify.success("Tutor profile deleted successfully", {
        description: `${deleting.name} has been removed.`,
      });
      setDeleteOpen(false);
      setDeleting(null);
      await fetchTutors();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete tutor";
      notify.error("Failed to delete tutor", { description: message });
    } finally {
      setDeletingLoading(false);
    }
  };

  const pendingCount = tutors.filter((t) => t.approval_status === "pending").length;
  const approvedCount = tutors.filter((t) => t.approval_status === "approved").length;
  const rejectedCount = tutors.filter((t) => t.approval_status === "rejected").length;

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { key: "name", header: "Lecturer" },
    {
      key: "subjects",
      header: "Subjects",
      render: (row) => {
        const t = row as unknown as ApiTutorAdmin;
        return t.subjects.length > 0 ? t.subjects.join(", ") : "—";
      },
    },
    {
      key: "hourly_rate",
      header: "Rate (UGX/hr)",
      render: (row) =>
        `UGX ${(row as unknown as ApiTutorAdmin).hourly_rate.toLocaleString()}`,
    },
    {
      key: "approval_status",
      header: "Approval",
      render: (row) => getStatusBadge((row as unknown as ApiTutorAdmin).approval_status),
    },
    {
      key: "is_available",
      header: "Availability",
      render: (row) => {
        const t = row as unknown as ApiTutorAdmin;
        return t.is_available ? (
          <Badge variant="outline">Available</Badge>
        ) : (
          <Badge variant="secondary">Unavailable</Badge>
        );
      },
    },
  ];

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
        title="Tutor Management"
        description="Review and manage lecturer tutoring profiles."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pending Review</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Approved</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Rejected</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{rejectedCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns}
          data={tutors as unknown as Record<string, unknown>[]}
          searchableFields={["name"]}
          searchPlaceholder="Search tutors..."
          emptyMessage="No tutor profiles found."
          rowActions={(row) => {
            const tutor = row as unknown as ApiTutorAdmin;
            return (
              <TableRowActions
                onView={() => openView(tutor)}
                onEdit={() => openEdit(tutor)}
                onDelete={() => openDelete(tutor)}
                showDelete={isSuperAdmin}
              />
            );
          }}
        />
      </div>

      <EntityViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Tutor profile"
        fields={
          viewing
            ? [
                { label: "Lecturer", value: viewing.name },
                {
                  label: "Subjects",
                  value: viewing.subjects.length ? viewing.subjects.join(", ") : "—",
                },
                {
                  label: "Hourly Rate",
                  value: `UGX ${viewing.hourly_rate.toLocaleString()}`,
                },
                { label: "Bio", value: viewing.bio || "—" },
                { label: "Approval", value: getStatusBadge(viewing.approval_status) },
                {
                  label: "Availability",
                  value: viewing.is_available ? "Available" : "Unavailable",
                },
              ]
            : []
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Edit Tutor Profile"
        description="Update tutoring profile details and approval status."
        onSubmit={handleUpdate}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tutor-subjects">Subjects (comma-separated)</Label>
            <Input
              id="tutor-subjects"
              value={formData.subjects}
              onChange={(e) =>
                setFormData((f) => ({ ...f, subjects: e.target.value }))
              }
              placeholder="e.g. Mathematics, Physics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor-rate">Hourly Rate (UGX)</Label>
            <Input
              id="tutor-rate"
              type="number"
              min={0}
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  hourly_rate: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor-bio">Bio</Label>
            <Textarea
              id="tutor-bio"
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Approval Status</Label>
            <Select
              value={formData.approval_status}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, approval_status: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="tutor-available"
              checked={formData.is_available}
              onCheckedChange={(checked) =>
                setFormData((f) => ({ ...f, is_available: checked === true }))
              }
            />
            <Label htmlFor="tutor-available">Available for tutoring</Label>
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
        title="Delete Tutor Profile"
        description={`Are you sure you want to delete ${deleting?.name}'s tutoring profile? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deletingLoading}
        destructive
      />
    </div>
  );
}
