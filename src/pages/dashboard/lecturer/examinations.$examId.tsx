import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export default function DashboardExamDetail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!examId) {
      navigate("/dashboard/examinations", { replace: true });
      return;
    }
    if (user.role === "student") {
      navigate(`/dashboard/student-assessments/${examId}`, { replace: true });
    } else {
      navigate(`/dashboard/assessments/${examId}`, { replace: true });
    }
  }, [examId, navigate, user.role]);

  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
