import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { api } from "@/lib/api";
import { PasswordInput } from "@/components/ui/password-input";
import heroCampus from "@/assets/hero-campus.jpg";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setValid(false);
      return;
    }

    api
      .validateResetToken(token)
      .then((result) => {
        setValid(result.valid);
        setAccountEmail(result.email ?? null);
      })
      .catch(() => setValid(false))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      notify.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.resetPassword(token, newPassword);
      notify.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    } catch (err) {
      notify.error("Reset failed", {
        description: err instanceof Error ? err.message : "Please request a new link.",
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

          <h1 className="text-3xl font-bold">Set new password</h1>

          {validating ? (
            <div className="mt-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !valid ? (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired. Request a new one from the
                sign-in page.
              </p>
              <Link
                to="/forgot-password"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {accountEmail
                  ? `Choose a new password for ${accountEmail}.`
                  : "Choose a new password for your account."}
              </p>
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <label className="block">
                  <span className="text-sm font-medium">New password</span>
                  <PasswordInput
                    required
                    variant="auth"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Confirm password</span>
                  <PasswordInput
                    required
                    variant="auth"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-soft disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
