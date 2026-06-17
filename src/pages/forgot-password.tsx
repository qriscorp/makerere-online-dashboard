import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { notify } from "@/lib/notify";
import { api } from "@/lib/api";
import heroCampus from "@/assets/hero-campus.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      notify.error("Enter your email address");
      return;
    }

    try {
      setLoading(true);
      const result = await api.forgotPassword(email.trim());
      setSubmitted(true);
      setEmailSent(result.email_sent ?? false);
      setDevResetUrl(result.reset_url ?? null);
      notify.success("Check your email", {
        description: result.email_sent
          ? "We sent a password reset link to your inbox."
          : result.message,
      });
    } catch (err) {
      notify.error("Request failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={heroCampus}
          alt="Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        <div className="relative flex h-full items-end p-12">
          <div className="max-w-md text-cream">
            <p className="font-display text-sm italic text-gold">Account recovery</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
              We&apos;ll help you get back into your account.
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <h1 className="font-display text-3xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email on your account and we&apos;ll send a reset link.
          </p>

          {submitted ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {emailSent ? (
                  <>
                    We sent a password reset link to <strong>{email}</strong>. Open the
                    email and click <strong>Reset password</strong> — the link expires in
                    60 minutes. Check your spam folder if you don&apos;t see it.
                  </>
                ) : (
                  <>
                    If an account exists for <strong>{email}</strong>, you will receive
                    instructions to reset your password. Check your inbox and spam folder.
                  </>
                )}
              </p>
              {devResetUrl && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-900">Email not sent (SMTP unavailable)</p>
                  <p className="mt-1 text-amber-800">
                    Use this link to reset your password:
                  </p>
                  <a
                    href={devResetUrl}
                    className="mt-2 block break-all font-mono text-xs text-primary underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}
              <Link
                to="/login"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@makonline.com"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
