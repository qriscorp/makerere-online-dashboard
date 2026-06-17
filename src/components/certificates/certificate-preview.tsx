import { forwardRef } from "react";
import { format } from "date-fns";
import { Award, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";

import type { ApiCertificate } from "@/lib/api";
import crest from "@/assets/makerere-logo.png";

const MAROON = "#6B1D1D";
const GOLD = "#C4A03C";
const INK = "#1F2937";

export interface CertificatePreviewProps {
  certificate: ApiCertificate;
  /** compact = thumbnail in list; full = modal / print */
  variant?: "compact" | "full";
  className?: string;
}

export const CertificatePreview = forwardRef<HTMLDivElement, CertificatePreviewProps>(
  function CertificatePreview({ certificate, variant = "full", className = "" }, ref) {
    const isCompact = variant === "compact";
    const typeLabel =
      certificate.certificate_type === "course" ? "Course Completion" : "Course Unit Completion";

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${isCompact ? "text-[0.55rem]" : ""} ${className}`}
        style={{
          aspectRatio: "297 / 210",
          background:
            "radial-gradient(ellipse at 50% 0%, #fff 0%, #faf6f0 45%, #f3ebe0 100%)",
        }}
      >
        {/* Watermark */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
          aria-hidden
        >
          <span
            className={`font-display font-bold uppercase tracking-[0.2em] ${isCompact ? "text-4xl" : "text-7xl"}`}
            style={{ color: MAROON }}
          >
            Makerere
          </span>
        </div>

        {/* Outer frame */}
        <div
          className="absolute inset-3 rounded-lg"
          style={{ border: `2px solid ${MAROON}` }}
        />
        <div
          className="absolute inset-5 rounded-md"
          style={{ border: `1px solid ${GOLD}` }}
        />

        {/* Corner ornaments */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <div
            key={corner}
            className={`absolute h-8 w-8 ${isCompact ? "h-5 w-5" : ""} ${
              corner === "tl"
                ? "left-6 top-6 border-l-2 border-t-2"
                : corner === "tr"
                  ? "right-6 top-6 border-r-2 border-t-2"
                  : corner === "bl"
                    ? "bottom-6 left-6 border-b-2 border-l-2"
                    : "bottom-6 right-6 border-b-2 border-r-2"
            }`}
            style={{ borderColor: GOLD }}
          />
        ))}

        <div
          className={`relative flex h-full flex-col items-center justify-between px-8 py-6 text-center ${isCompact ? "px-4 py-3" : "md:px-12 md:py-8"}`}
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={crest}
              alt=""
              className={`object-contain ${isCompact ? "h-8 w-8" : "h-14 w-14 md:h-16 md:w-16"}`}
            />
            <p
              className={`font-display font-bold uppercase tracking-[0.15em] ${isCompact ? "text-[0.65rem]" : "text-sm md:text-base"}`}
              style={{ color: MAROON }}
            >
              Makerere Online School
            </p>
            <p className="text-[0.6em] uppercase tracking-[0.35em] text-stone-500">
              Kampala, Uganda
            </p>
          </div>

          {/* Title band */}
          <div className="w-full max-w-md space-y-2">
            <div
              className="mx-auto h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
            <p
              className={`font-semibold uppercase tracking-[0.25em] ${isCompact ? "text-[0.6rem]" : "text-xs"}`}
              style={{ color: GOLD }}
            >
              Certificate of {typeLabel}
            </p>
            <div
              className="mx-auto h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
          </div>

          {/* Body */}
          <div className={`max-w-2xl space-y-2 ${isCompact ? "space-y-1" : "space-y-3"}`}>
            <p className="text-stone-500">This is to certify that</p>
            <p
              className={`font-display font-bold leading-tight ${isCompact ? "text-lg" : "text-2xl md:text-4xl"}`}
              style={{ color: INK }}
            >
              {certificate.student_name}
            </p>
            <p className="text-stone-500">
              has successfully completed the{" "}
              {certificate.certificate_type === "course" ? "course" : "course unit"}
            </p>
            <p
              className={`font-semibold leading-snug ${isCompact ? "text-sm" : "text-lg md:text-xl"}`}
              style={{ color: MAROON }}
            >
              {certificate.title}
            </p>
            <p className="text-stone-500">
              with merit on{" "}
              <span className="font-medium text-stone-700">
                {format(new Date(certificate.issue_date), "dd MMMM yyyy")}
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className={`grid w-full max-w-2xl grid-cols-3 items-end gap-4 ${isCompact ? "gap-2" : ""}`}>
            <div className="text-left">
              <div
                className={`mb-1 border-b border-stone-300 ${isCompact ? "w-16" : "w-28"}`}
              />
              <p className="text-[0.65em] font-medium text-stone-600">Academic Registrar</p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`mb-1 flex items-center justify-center rounded-full border-2 ${isCompact ? "h-10 w-10" : "h-16 w-16"}`}
                style={{
                  borderColor: certificate.status === "active" ? GOLD : "#dc2626",
                  color: certificate.status === "active" ? MAROON : "#dc2626",
                }}
              >
                {certificate.status === "active" ? (
                  <ShieldCheck className={isCompact ? "h-5 w-5" : "h-8 w-8" } />
                ) : (
                  <Award className={isCompact ? "h-5 w-5" : "h-8 w-8" } />
                )}
              </div>
              <p
                className="text-[0.6em] font-semibold uppercase tracking-wider"
                style={{
                  color: certificate.status === "active" ? "#059669" : "#dc2626",
                }}
              >
                {certificate.status === "active" ? "Verified" : "Revoked"}
              </p>
            </div>

            <div className="text-right">
              <div
                className={`mb-1 ml-auto border-b border-stone-300 ${isCompact ? "w-16" : "w-28"}`}
              />
              <p className="text-[0.65em] font-medium text-stone-600">Dean of School</p>
            </div>
          </div>

          <p
            className={`font-mono text-stone-400 ${isCompact ? "text-[0.55rem]" : "text-[0.65rem]"}`}
          >
            {certificate.certificate_number}
          </p>
        </div>
      </div>
    );
  },
);

// ─── PDF generation (jsPDF — reliable, no DOM capture) ─────────────────────

let logoDataUrlPromise: Promise<string | null> | null = null;

function loadLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = crest;
    });
  }
  return logoDataUrlPromise;
}

function drawGoldLine(pdf: jsPDF, x1: number, y: number, x2: number) {
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.4);
  pdf.line(x1, y, x2, y);
}

function drawCorner(pdf: jsPDF, x: number, y: number, size: number, corner: "tl" | "tr" | "bl" | "br") {
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.6);
  if (corner === "tl") {
    pdf.line(x, y, x, y + size);
    pdf.line(x, y, x + size, y);
  } else if (corner === "tr") {
    pdf.line(x, y, x, y + size);
    pdf.line(x, y, x - size, y);
  } else if (corner === "bl") {
    pdf.line(x, y, x, y - size);
    pdf.line(x, y, x + size, y);
  } else {
    pdf.line(x, y, x, y - size);
    pdf.line(x, y, x - size, y);
  }
}

/** Generate and save a certificate PDF directly from API data. */
export async function downloadCertificatePdf(certificate: ApiCertificate): Promise<void> {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  const margin = 14;

  const typeLabel =
    certificate.certificate_type === "course" ? "Course Completion" : "Course Unit Completion";
  const typeText = certificate.certificate_type === "course" ? "course" : "course unit";
  const issueDate = format(new Date(certificate.issue_date), "dd MMMM yyyy");

  // Background
  pdf.setFillColor(250, 246, 240);
  pdf.rect(0, 0, w, h, "F");

  // Outer maroon border
  pdf.setDrawColor(107, 29, 29);
  pdf.setLineWidth(1.2);
  pdf.roundedRect(margin, margin - 2, w - margin * 2, h - margin * 2 + 4, 3, 3, "S");

  // Inner gold border
  pdf.setDrawColor(196, 160, 60);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(margin + 4, margin + 2, w - margin * 2 - 8, h - margin * 2 - 4, 2, 2, "S");

  // Corner ornaments
  const cornerInset = margin + 6;
  const cornerSize = 8;
  drawCorner(pdf, cornerInset, cornerInset, cornerSize, "tl");
  drawCorner(pdf, w - cornerInset, cornerInset, cornerSize, "tr");
  drawCorner(pdf, cornerInset, h - cornerInset, cornerSize, "bl");
  drawCorner(pdf, w - cornerInset, h - cornerInset, cornerSize, "br");

  // Watermark (light text)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(48);
  pdf.setTextColor(240, 235, 228);
  pdf.text("MAKERERE", w / 2, h / 2 + 8, { align: "center" });

  // Logo
  const logoData = await loadLogoDataUrl();
  if (logoData) {
    pdf.addImage(logoData, "PNG", w / 2 - 11, margin + 10, 22, 22);
  }

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(107, 29, 29);
  pdf.text("MAKERERE ONLINE SCHOOL", w / 2, margin + 38, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(120, 113, 108);
  pdf.text("KAMPALA, UGANDA", w / 2, margin + 44, { align: "center" });

  drawGoldLine(pdf, w / 2 - 45, margin + 50, w / 2 + 45);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(196, 160, 60);
  pdf.text(`CERTIFICATE OF ${typeLabel.toUpperCase()}`, w / 2, margin + 57, { align: "center" });

  drawGoldLine(pdf, w / 2 - 45, margin + 62, w / 2 + 45);

  // Body
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(120, 113, 108);
  pdf.text("This is to certify that", w / 2, margin + 74, { align: "center" });

  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(31, 41, 55);
  pdf.text(certificate.student_name, w / 2, margin + 88, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(120, 113, 108);
  pdf.text(`has successfully completed the ${typeText}`, w / 2, margin + 98, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(107, 29, 29);
  const titleLines = pdf.splitTextToSize(certificate.title, w - margin * 2 - 40);
  pdf.text(titleLines, w / 2, margin + 108, { align: "center" });

  const titleOffset = (titleLines.length - 1) * 6;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(120, 113, 108);
  pdf.text(`with merit on ${issueDate}`, w / 2, margin + 118 + titleOffset, { align: "center" });

  // Signature row
  const footerY = h - margin - 28;
  pdf.setDrawColor(209, 213, 219);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 20, footerY, margin + 55, footerY);
  pdf.line(w - margin - 55, footerY, w - margin - 20, footerY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(87, 83, 78);
  pdf.text("Academic Registrar", margin + 20, footerY + 5);
  pdf.text("Dean of School", w - margin - 20, footerY + 5, { align: "right" });

  // Verified seal
  const sealX = w / 2;
  const sealY = footerY - 2;
  const isActive = certificate.status === "active";
  pdf.setDrawColor(isActive ? 196 : 220, isActive ? 160 : 38, isActive ? 60 : 38);
  pdf.setLineWidth(0.8);
  pdf.circle(sealX, sealY, 10, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(isActive ? 5 : 220, isActive ? 150 : 38, isActive ? 105 : 38);
  pdf.text(isActive ? "VERIFIED" : "REVOKED", sealX, sealY + 14, { align: "center" });

  // Certificate number
  pdf.setFont("courier", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(168, 162, 158);
  pdf.text(certificate.certificate_number, w / 2, h - margin - 4, { align: "center" });

  pdf.save(`Certificate-${certificate.certificate_number}.pdf`);
}
