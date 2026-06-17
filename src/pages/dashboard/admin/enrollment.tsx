import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BookOpen, Clock, CreditCard, Users, Loader2 } from "lucide-react";

import {
  api,
  ApiEnrollment,
  ApiIntake,
  ApiCourse,
  ApiUser,
} from "@/lib/api";
import { notify } from "@/lib/notify";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { EntityViewDialog } from "@/components/dashboard/entity-view-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { TableRowActions } from "@/components/dashboard/table-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}

// ─── Admin View ────────────────────────────────────────────────────────────────

function AdminEnrollmentView() {
  const { user } = useAuth();
  const isSuperAdmin = user.role === "super_admin";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewing, setViewing] = useState<ApiEnrollment | null>(null);
  const [editing, setEditing] = useState<ApiEnrollment | null>(null);
  const [deleting, setDeleting] = useState<ApiEnrollment | null>(null);
  const [formData, setFormData] = useState({ status: "active", payment_status: "completed" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentData, usersData, intakesData, coursesData] = await Promise.all([
        api.getEnrollments(),
        api.getUsers(),
        api.getIntakes(),
        api.getCourses(),
      ]);
      setEnrollments(enrollmentData);
      setUsers(usersData);
      setIntakes(intakesData);
      setCourses(coursesData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load enrollments";
      notify.error("Failed to load enrollments", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id: string) =>
    users.find((u) => u.id === id)?.name ?? id.slice(0, 8) + "…";
  const getIntakeName = (id: string) =>
    intakes.find((i) => i.id === id)?.name ?? id.slice(0, 8) + "…";
  const getCourseName = (id: string) =>
    courses.find((c) => c.id === id)?.title ?? id.slice(0, 8) + "…";

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "payment_pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Payment Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (statusFilter === "all") return enrollments;
    return enrollments.filter((e) => e.status === statusFilter);
  }, [statusFilter, enrollments]);

  const columns: ColumnDef<ApiEnrollment>[] = [
    {
      key: "student_id",
      header: "Student",
      render: (row) => getStudentName(row.student_id),
    },
    {
      key: "intake_id",
      header: "Intake",
      render: (row) => getIntakeName(row.intake_id),
    },
    {
      key: "course_id",
      header: "Course",
      render: (row) => getCourseName(row.course_id),
    },
    {
      key: "enrollment_date",
      header: "Enrollment Date",
      render: (row) => formatDate(row.enrollment_date),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.payment_status),
    },
  ];

  const openView = (row: ApiEnrollment) => {
    setViewing(row);
    setViewOpen(true);
  };

  const openEdit = (row: ApiEnrollment) => {
    setEditing(row);
    setFormData({ status: row.status, payment_status: row.payment_status });
    setFormOpen(true);
  };

  const openDelete = (row: ApiEnrollment) => {
    setDeleting(row);
    setDeleteOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSubmitting(true);
      await api.updateEnrollment(editing.id, formData);
      notify.success("Enrollment updated successfully");
      setFormOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update enrollment";
      notify.error("Failed to update enrollment", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setDeletingLoading(true);
      await api.deleteEnrollment(deleting.id);
      notify.success("Enrollment deleted successfully");
      setDeleteOpen(false);
      setDeleting(null);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete enrollment";
      notify.error("Failed to delete enrollment", { description: message });
    } finally {
      setDeletingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Management"
        description="View and manage student enrollments across intakes."
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={filteredEnrollments as unknown as Record<string, unknown>[]}
          searchableFields={["student_id", "intake_id", "course_id"]}
          searchPlaceholder="Search enrollments..."
          emptyMessage="No enrollments found."
          rowActions={(row) => {
            const enrollment = row as unknown as ApiEnrollment;
            return (
              <TableRowActions
                onView={() => openView(enrollment)}
                onEdit={() => openEdit(enrollment)}
                onDelete={() => openDelete(enrollment)}
                showDelete={isSuperAdmin}
              />
            );
          }}
        />
      </div>

      <EntityViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Enrollment details"
        fields={
          viewing
            ? [
                { label: "Student", value: getStudentName(viewing.student_id) },
                { label: "Intake", value: getIntakeName(viewing.intake_id) },
                { label: "Course", value: getCourseName(viewing.course_id) },
                {
                  label: "Enrollment Date",
                  value: formatDate(viewing.enrollment_date),
                },
                { label: "Status", value: getStatusBadge(viewing.status) },
                {
                  label: "Payment Status",
                  value: getPaymentBadge(viewing.payment_status),
                },
              ]
            : []
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Edit Enrollment"
        description="Update enrollment and payment status."
        onSubmit={handleUpdate}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData((f) => ({ ...f, status: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, payment_status: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
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
        title="Delete Enrollment"
        description={`Remove enrollment for ${deleting ? getStudentName(deleting.student_id) : "this student"}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deletingLoading}
        destructive
      />
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────

function StudentEnrollmentView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [intakes, setIntakes] = useState<ApiIntake[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [feeRange, setFeeRange] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentData, intakeData, courseData] = await Promise.all([
        api.getEnrollments(),
        api.getIntakes(),
        api.getCourses(),
      ]);
      setEnrollments(enrollmentData);
      setIntakes(intakeData);
      setCourses(courseData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Already enrolled intake IDs (not dropped)
  const enrolledIntakeIds = enrollments
    .filter((e) => e.status !== "dropped")
    .map((e) => e.intake_id);

  // Available intakes (active, has capacity, not already enrolled)
  const availableIntakes = useMemo(() => {
    let filtered = intakes.filter(
      (i) =>
        i.status === "active" &&
        i.enrolled_count < i.capacity &&
        !enrolledIntakeIds.includes(i.id),
    );

    if (yearFilter !== "all") {
      filtered = filtered.filter((i) => i.year_level === parseInt(yearFilter));
    }

    if (feeRange !== "all") {
      // Fee range filter removed — intakes no longer have fees
    }

    return filtered;
  }, [intakes, yearFilter, feeRange, enrolledIntakeIds]);

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.title ?? courseId.slice(0, 8);
  };

  const getIntakeCourseNames = (intake: ApiIntake) => {
    if (!intake.course_ids || intake.course_ids.length === 0) return "No courses";
    return intake.course_ids.map((id) => getCourseName(id)).join(", ");
  };

  const handleCompletePayment = async (enrollment: ApiEnrollment) => {
    try {
      setPaying(enrollment.id);
      const updated = await api.completeEnrollmentPayment(enrollment.id);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
      toast.success("Payment completed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete payment");
    } finally {
      setPaying(null);
    }
  };

  const getIntakeName = (intakeId: string) => {
    const intake = intakes.find((i) => i.id === intakeId);
    return intake?.name ?? intakeId.slice(0, 8);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "payment_pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Payment Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const historyColumns: ColumnDef<ApiEnrollment>[] = [
    {
      key: "intake_id",
      header: "Intake",
      render: (row) => getIntakeName(row.intake_id),
    },
    {
      key: "enrollment_date",
      header: "Enrollment Date",
      render: (row) => format(new Date(row.enrollment_date), "MMM dd, yyyy"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "payment_status",
      header: "Payment Status",
      render: (row) => getPaymentBadge(row.payment_status),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment"
        description="Browse available intakes and manage your enrollments."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Year Level</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="1">Year 1</SelectItem>
              <SelectItem value="2">Year 2</SelectItem>
              <SelectItem value="3">Year 3</SelectItem>
              <SelectItem value="4">Year 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fee Range</Label>
          <Select value={feeRange} onValueChange={setFeeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Fees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fees</SelectItem>
              <SelectItem value="under3m">Under UGX 3M</SelectItem>
              <SelectItem value="3m-5m">UGX 3M - 5M</SelectItem>
              <SelectItem value="over5m">Over UGX 5M</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Intakes Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Available Intakes</h2>
        {availableIntakes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <p>No intakes match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableIntakes.map((intake) => (
              <Card key={intake.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-tight">{intake.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Year {intake.year_level}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="truncate">{getIntakeCourseNames(intake)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Deadline: {format(new Date(intake.enrollment_deadline), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{intake.enrolled_count} / {intake.capacity} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(intake.start_date), "MMM dd, yyyy")} –{" "}
                      {format(new Date(intake.end_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => navigate(`/dashboard/enrollment/${intake.id}`)}>
                    View Courses
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My Enrollments</h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <DataTable<Record<string, unknown>>
            columns={historyColumns as unknown as ColumnDef<Record<string, unknown>>[]}
            data={enrollments as unknown as Record<string, unknown>[]}
            searchableFields={["intake_id"]}
            searchPlaceholder="Search enrollments..."
            emptyMessage="You have no enrollments yet."
            rowActions={(row) => {
              const enrollment = row as unknown as ApiEnrollment;
              if (enrollment.status === "payment_pending") {
                return (
                  <Button
                    size="sm"
                    onClick={() => handleCompletePayment(enrollment)}
                    disabled={paying === enrollment.id}
                  >
                    {paying === enrollment.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    Complete Payment
                  </Button>
                );
              }
              return null;
            }}
          />
        </div>
      </div>

    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardEnrollment() {
  const { user } = useAuth();

  if (user.role === "student") {
    return <StudentEnrollmentView />;
  }

  return <AdminEnrollmentView />;
}
