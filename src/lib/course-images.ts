import { resolveImageUrl } from "@/lib/api";
import heroCampus from "@/assets/hero-campus.jpg";
import studentLearning from "@/assets/student-learning.jpg";
import books from "@/assets/books.jpg";
import lab from "@/assets/lab.jpg";
import teacherOnline from "@/assets/teacher-online.jpg";
import liveClass from "@/assets/live-class.jpg";
import studentsGroup from "@/assets/students-group.jpg";
import graduation from "@/assets/graduation.jpg";

/** Local images bundled with the app — used for course cards when no upload exists. */
const COURSE_IMAGES_BY_TITLE: Record<string, string> = {
  "Bachelor of Science in Computer Science": lab,
  "Bachelor of Business Administration": books,
};

const DEFAULT_COURSE_IMAGE = heroCampus;

const APP_COURSE_IMAGES = [
  heroCampus,
  studentLearning,
  books,
  lab,
  teacherOnline,
  liveClass,
  studentsGroup,
  graduation,
];

function isUploadedCourseImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  if (imageUrl.startsWith("/uploads/")) return true;
  const resolved = resolveImageUrl(imageUrl);
  return Boolean(resolved?.includes("/uploads/"));
}

/** Resolve course card image: API upload first, then app assets by title, never the logo splash. */
export function getCourseImageSrc(
  imageUrl: string | null | undefined,
  courseTitle?: string,
): string {
  if (isUploadedCourseImage(imageUrl)) {
    return resolveImageUrl(imageUrl)!;
  }

  if (courseTitle && COURSE_IMAGES_BY_TITLE[courseTitle]) {
    return COURSE_IMAGES_BY_TITLE[courseTitle];
  }

  if (courseTitle) {
    let hash = 0;
    for (let i = 0; i < courseTitle.length; i++) {
      hash = (hash + courseTitle.charCodeAt(i)) % APP_COURSE_IMAGES.length;
    }
    return APP_COURSE_IMAGES[hash];
  }

  return DEFAULT_COURSE_IMAGE;
}

export function hasUploadedCourseImage(imageUrl: string | null | undefined): boolean {
  return isUploadedCourseImage(imageUrl);
}
