import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { api, type ApiAssessment, type ApiCourseUnit } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type ColumnDef } from "@/components/dashboard/data-table";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExamFormData {
  title: string;
  courseUnitId: string;
  type: string;
  instructions: string;
  passMark: number;
  timeLimit: string;
  maxAttempts: number;
  startDate: string;
  endDate: string;
}

const emptyForm: ExamFormData = {
  title: "",
  courseUnitId: "",
  type: "",
  instructions: "",
  passMark: 50,
  timeLimit: "",
  maxAttempts: 1,
  startDate: "",
  endDate: "",
};

function isAssessmentActive(assessment: ApiAssessment): boolean {
  const now = new Date();
  const start = assessment.start_date ? new Date(assessment.start_date) : null;
  const end = assessment.end_date ? new Date(assessment.end_date) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function getTypeBadge(type: string) {
  switch (type) {
    case "quiz":
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
          Quiz
        </Badge>
      );
    case "assignment":
      return (
        <Badge className="border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100">
          Assignment
        </Badge>
      );
    case "final_exam":
      return (
        <Badge className="border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100">
          Final Exam
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

export default function DashboardExaminations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLecturer = user.role === "lecturer";
  const isStudent = user.role === "student";

  const [exams, setExams] = useState<ApiAssessment[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const lecturerUnits = isLecturer
    ? courseUnits.filter((u) => u.lecturer_id === user.id)
    : courseUnits;

  const displayedExams = isStudent
    ? exams.filter(isAssessmentActive)
    : exams;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [assessmentsData, unitsData] = await Promise.all([
        api.getAssessments(),
        api.getCourseUnits(),
      ]);
      setExams(assessmentsData);
      setCourseUnits(unitsData);
    } catch {
      toast.error("Failed to load examinations");
    } finally {
      setLoading(false);
    }
  }

  const getCourseUnitName = (unitId: string) => {
    const unit = courseUnits.find((u) => u.id === unitId);
    return unit?.title ?? "Unknown Unit";
  };

  const columns: ColumnDef<ApiAssessment>[] = [
    { key: "title", header: "Title" },
    {
      key: "course_unit_id",
      header: "Course Unit",
      render: (row) => getCourseUnitName(row.course_unit_id),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => getTypeBadge(row.type),
    },
    {
      key: "end_date",
      header: "Due Date",
      render: (row) =>
        row.end_date ? format(new Date(row.end_date), "MMM d, yyyy") : "—",
    },
    {
      key: "pass_mark",
      header: "Pass Mark",
      render: (row) => `${row.pass_mark}%`,
    },
    {
      key: "time_limit",
      header: "Time Limit",
      render: (row) => (row.time_limit ? `${row.time_limit} min` : "Untimed"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        isAssessmentActive(row) ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const openCreateForm = () => {
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.courseUnitId) newErrors.courseUnitId = "Course unit is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.createAssessment({
        course_unit_id: formData.courseUnitId,
        title: formData.title,
        type: formData.type,
        instructions: formData.instructions,
        pass_mark: formData.passMark,
        time_limit: formData.timeLimit ? Number(formData.timeLimit) : null,
        max_attempts: formData.maxAttempts,
        start_date: formData.startDate,
        end_date: formData.endDate,
      });
      toast.success("Exam created successfully");
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create exam");
    }
  };

  const handleViewDetails = (exam: ApiAssessment) => {
    if (isStudent) {
      navigate(`/dashboard/student-assessments/${exam.id}`);
    } else {
      navigate(`/dashboard/assessments/${exam.id}`);
    }
  };

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
        title="Examinations"
        description={
          isStudent
            ? "View and take your exams and assessments."
            : isLecturer
              ? "Create and manage your exams and assessments."
              : "Create and manage exams, quizzes, and assessments."
        }
      >
        {!isStudent && (
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <DataTable<Record<string, unknown>>
          columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
          data={displayedExams as unknown as Record<string, unknown>[]}
          searchableFields={["title"]}
          searchPlaceholder="Search examinations..."
          rowActions={(row) => {
            const exam = row as unknown as ApiAssessment;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(exam)}>
                    {isStudent ? "Take Assessment" : "View Details"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
        />
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Create Exam"
        description="Set up a new exam or assessment."
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Title</Label>
            <Input
              id="exam-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Data Structures Mid-Semester Quiz"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>Course Unit</Label>
            <Select
              value={formData.courseUnitId}
              onValueChange={(val) => setFormData((f) => ({ ...f, courseUnitId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course unit" />
              </SelectTrigger>
              <SelectContent>
                {(isLecturer ? lecturerUnits : courseUnits).map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courseUnitId && (
              <p className="text-xs text-destructive">{errors.courseUnitId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData((f) => ({ ...f, type: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="final_exam">Final Exam</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam-instructions">Instructions</Label>
            <Textarea
              id="exam-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData((f) => ({ ...f, instructions: e.target.value }))}
              placeholder="Exam instructions for students"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-pass-mark">Pass Mark (0-100)</Label>
              <Input
                id="exam-pass-mark"
                type="number"
                min={0}
                max={100}
                value={formData.passMark}
                onChange={(e) => setFormData((f) => ({ ...f, passMark: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-time-limit">Time Limit (minutes, optional)</Label>
              <Input
                id="exam-time-limit"
                type="number"
                min={1}
                value={formData.timeLimit}
                onChange={(e) => setFormData((f) => ({ ...f, timeLimit: e.target.value }))}
                placeholder="Leave empty for untimed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam-max-attempts">Maximum Attempts</Label>
            <Input
              id="exam-max-attempts"
              type="number"
              min={1}
              value={formData.maxAttempts}
              onChange={(e) => setFormData((f) => ({ ...f, maxAttempts: Number(e.target.value) }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-start-date">Start Date</Label>
              <Input
                id="exam-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
              />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-end-date">End Date</Label>
              <Input
                id="exam-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>
        </div>
      </EntityFormDialog>
    </div>
  );
}
