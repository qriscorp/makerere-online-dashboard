import { useState, useEffect } from "react";
import { Plus, Video, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api, type ApiVirtualClass, type ApiCourseUnit } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { EntityFormDialog } from "@/components/dashboard/entity-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassFormData {
  title: string;
  courseUnitId: string;
  date: string;
  startTime: string;
  duration: number;
  platform: string;
  meetingLink: string;
}

const emptyForm: ClassFormData = {
  title: "",
  courseUnitId: "",
  date: "",
  startTime: "",
  duration: 60,
  platform: "",
  meetingLink: "",
};

function getPlatformBadge(platform: string) {
  if (platform === "zoom") {
    return (
      <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
        Zoom
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
      Jitsi
    </Badge>
  );
}

function isUpcoming(cls: ApiVirtualClass): boolean {
  if (cls.is_live) return true;
  const classDate = new Date(cls.date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return classDate >= now;
}

export default function DashboardVirtualLearning() {
  const { user } = useAuth();
  const isLecturer = user.role === "lecturer";
  const isStudent = user.role === "student";

  const [classes, setClasses] = useState<ApiVirtualClass[]>([]);
  const [courseUnits, setCourseUnits] = useState<ApiCourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const lecturerUnits = isLecturer
    ? courseUnits.filter((u) => u.lecturer_id === user.id)
    : courseUnits;

  const upcomingClasses = classes
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastClasses = classes
    .filter((c) => !isUpcoming(c))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [classesData, unitsData] = await Promise.all([
        api.getVirtualClasses(),
        api.getCourseUnits(),
      ]);
      setClasses(classesData);
      setCourseUnits(unitsData);
    } catch {
      toast.error("Failed to load virtual classes");
    } finally {
      setLoading(false);
    }
  }

  const getCourseUnitName = (unitId: string) => {
    const unit = courseUnits.find((u) => u.id === unitId);
    return unit?.title ?? "Unknown Unit";
  };

  const openScheduleForm = () => {
    setFormData(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.courseUnitId) newErrors.courseUnitId = "Course unit is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    if (!formData.meetingLink.trim()) newErrors.meetingLink = "Meeting link is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.createVirtualClass({
        course_unit_id: formData.courseUnitId,
        title: formData.title,
        date: formData.date,
        start_time: formData.startTime,
        duration: formData.duration,
        platform: formData.platform,
        meeting_link: formData.meetingLink,
      });
      toast.success("Class scheduled successfully");
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule class");
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
        title="Virtual Learning"
        description={
          isStudent
            ? "Join live classes for your enrolled courses."
            : isLecturer
              ? "Schedule and manage your live classes."
              : "Manage live classes and virtual sessions."
        }
      >
        {!isStudent && (
          <Button onClick={openScheduleForm}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Class
          </Button>
        )}
      </PageHeader>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming Classes</h2>
        <div className="space-y-3">
          {upcomingClasses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <p>No upcoming classes scheduled.</p>
            </div>
          ) : (
            upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cls.title}</p>
                      {cls.is_live && (
                        <Badge className="border-transparent bg-red-100 text-red-800 hover:bg-red-100">
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{getCourseUnitName(cls.course_unit_id)}</span>
                      <span>
                        {format(new Date(cls.date), "MMM d, yyyy")} at {cls.start_time}
                      </span>
                      <span>{cls.duration} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getPlatformBadge(cls.platform)}
                  <Button size="sm" onClick={() => window.open(cls.meeting_link, "_blank")}>
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Join
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Past Classes</h2>
        <div className="space-y-3">
          {pastClasses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
              <p>No past classes.</p>
            </div>
          ) : (
            pastClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{cls.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{getCourseUnitName(cls.course_unit_id)}</span>
                      <span>
                        {format(new Date(cls.date), "MMM d, yyyy")} at {cls.start_time}
                      </span>
                      <span>{cls.duration} min</span>
                    </div>
                  </div>
                </div>
                {getPlatformBadge(cls.platform)}
              </div>
            ))
          )}
        </div>
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Schedule Class"
        description="Schedule a new virtual class session."
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-title">Title</Label>
            <Input
              id="class-title"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Data Structures - Binary Trees"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-date">Date</Label>
              <Input
                id="class-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-time">Start Time</Label>
              <Input
                id="class-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((f) => ({ ...f, startTime: e.target.value }))}
              />
              {errors.startTime && <p className="text-xs text-destructive">{errors.startTime}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-duration">Duration (minutes)</Label>
            <Input
              id="class-duration"
              type="number"
              min={15}
              value={formData.duration}
              onChange={(e) => setFormData((f) => ({ ...f, duration: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={(val) => setFormData((f) => ({ ...f, platform: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="jitsi">Jitsi</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && <p className="text-xs text-destructive">{errors.platform}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-link">Meeting Link</Label>
            <Input
              id="class-link"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData((f) => ({ ...f, meetingLink: e.target.value }))}
              placeholder="https://zoom.us/j/..."
            />
            {errors.meetingLink && <p className="text-xs text-destructive">{errors.meetingLink}</p>}
          </div>
        </div>
      </EntityFormDialog>
    </div>
  );
}
