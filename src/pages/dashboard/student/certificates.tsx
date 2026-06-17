import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Award, Download, Eye, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { api } from "@/lib/api";
import type { ApiCertificate } from "@/lib/api";
import {
  CertificatePreview,
  downloadCertificatePdf,
} from "@/components/certificates/certificate-preview";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function typeBadge(cert: ApiCertificate) {
  if (cert.certificate_type === "course") {
    return (
      <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
        Course
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
      Course Unit
    </Badge>
  );
}

function CertificateSummaryCard({
  certificate,
  onView,
  onDownload,
  downloading,
}: {
  certificate: ApiCertificate;
  onView: (cert: ApiCertificate) => void;
  onDownload: (cert: ApiCertificate) => void;
  downloading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <button
        type="button"
        onClick={() => onView(certificate)}
        className="block w-full text-left transition-opacity hover:opacity-95"
      >
        <CertificatePreview certificate={certificate} variant="compact" />
      </button>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {typeBadge(certificate)}
              {certificate.status === "active" ? (
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Revoked</Badge>
              )}
            </div>
            <h3 className="truncate font-semibold">{certificate.title}</h3>
            <p className="text-xs text-muted-foreground">
              Issued {format(new Date(certificate.issue_date), "dd MMM yyyy")}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {certificate.certificate_number}
            </p>
          </div>
          <Award className="h-8 w-8 shrink-0 text-primary/30" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(certificate)} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onDownload(certificate)}
            disabled={downloading || certificate.status !== "active"}
            className="gap-1.5"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ApiCertificate | null>(null);

  useEffect(() => {
    api
      .getCertificates()
      .then(setCertificates)
      .catch((err) => toast.error(err.message || "Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(cert: ApiCertificate) {
    setDownloadingId(cert.id);
    try {
      await downloadCertificatePdf(cert);
      toast.success("Certificate downloaded");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="View, verify, and download your earned certificates."
      />

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
          <Award className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Complete your courses and course units to earn certificates. They will appear here
            once issued by your school.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <CertificateSummaryCard
                key={cert.id}
                certificate={cert}
                onView={setViewing}
                onDownload={(c) => handleDownload(c)}
                downloading={downloadingId === cert.id}
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto p-0 sm:p-0">
          {viewing && (
            <>
              <DialogHeader className="border-b border-border px-6 py-4">
                <DialogTitle>{viewing.title}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {viewing.certificate_number}
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted/30 p-4 md:p-6">
                <div className="mx-auto max-w-4xl rounded-xl shadow-lg">
                  <CertificatePreview certificate={viewing} variant="full" />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row">
                <Button variant="outline" asChild className="gap-1.5">
                  <Link
                    to={`/certificate-verification?serial=${encodeURIComponent(viewing.certificate_number)}`}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify online
                  </Link>
                </Button>
                <Button
                  onClick={() => handleDownload(viewing)}
                  disabled={downloadingId === viewing.id || viewing.status !== "active"}
                  className="gap-1.5"
                >
                  {downloadingId === viewing.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
