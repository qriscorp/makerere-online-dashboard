import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { notify } from "@/lib/notify";
import { useAuth } from "@/lib/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import heroCampus from "@/assets/hero-campus.jpg";

type Step = "register" | "verify";

export default function GetStarted() {
  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      const message = "Passwords do not match";
      setError(message);
      notify.error(message);
      return;
    }
    if (password.length < 8) {
      const message = "Password must be at least 8 characters";
      setError(message);
      notify.error(message);
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password);
      setDevCode(result.dev_code ?? null);
      setStep("verify");
      notify.success("Check your email", {
        description: result.message,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      notify.error("Registration failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = code.trim().replace(/\s/g, "");
    if (trimmed.length !== 6) {
      const message = "Enter the 6-digit verification code";
      setError(message);
      notify.error(message);
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email.trim(), trimmed);
      notify.success("Email verified!", {
        description: "Welcome to Makerere Online.",
      });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
      notify.error("Verification failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const result = await resendVerification(email.trim());
      setDevCode(result.dev_code ?? null);
      notify.success("Code resent", { description: result.message });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resend code";
      notify.error("Resend failed", { description: message });
    } finally {
      setResending(false);
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
            <p className="text-sm italic text-gold">
              Pro Futuro Aedificamus
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight">
              Start your journey at Makerere Online.
            </h2>
            <p className="mt-4 text-cream/80">
              Register as a student, verify your email, and start learning.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold">
            {step === "register" ? "Create account" : "Verify your email"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "register"
              ? "Student registration only. We'll send a verification code to your email."
              : `Enter the 6-digit code sent to ${email}`}
          </p>

          {step === "register" ? (
            <form
              onSubmit={handleRegister}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <label className="block">
                <span className="text-sm font-medium">Full Name</span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aisha Nansubuga"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <PasswordInput
                  required
                  variant="auth"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Confirm Password</span>
                <PasswordInput
                  required
                  variant="auth"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerify}
              className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Check your inbox and spam folder for the verification code.
                </span>
              </div>

              {devCode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-900">Development code</p>
                  <p className="mt-1 font-mono text-lg tracking-widest text-amber-800">
                    {devCode}
                  </p>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium">Verification code</span>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-center font-mono text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verifying..." : "Verify & create account"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setCode("");
                    setError("");
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                >
                  {resending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Resend code
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
