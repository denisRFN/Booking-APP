import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Armchair } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { login } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {/* Background: blurred office atmosphere */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80)"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(251,191,36,0.12),transparent_55%)]" />

      <div
        className={cn(
          "relative z-10 w-full max-w-[420px] rounded-[22px] border border-white/[0.12]",
          "bg-black/45 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_rgba(0,0,0,0.55),0_0_120px_-20px_rgba(251,191,36,0.15)]",
          "backdrop-blur-xl",
          "animate-slide-up opacity-0 [animation-fill-mode:forwards]"
        )}
      >
        <div className="px-8 pb-8 pt-9">
          {/* App icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_32px_-4px_rgba(251,191,36,0.65),inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Armchair className="h-7 w-7 text-white drop-shadow-sm" strokeWidth={1.75} />
          </div>

          <h1 className="text-center font-display text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-1.5 text-center text-sm text-white/60">Sign in to reserve your desk.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-white/90">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-white/[0.1] bg-black/40 pl-11 text-white placeholder:text-white/35 focus-visible:border-primary/40 focus-visible:ring-primary/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="text-xs font-medium text-white/90">
                  Password
                </Label>
                <span className="cursor-not-allowed text-[11px] text-white/40" title="Not available yet">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-white/[0.1] bg-black/40 pl-11 pr-11 text-white placeholder:text-white/35 focus-visible:border-primary/40 focus-visible:ring-primary/25"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-center text-sm text-rose-400">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "h-12 w-full rounded-xl border-0 font-semibold text-white shadow-[0_0_28px_-6px_rgba(251,146,60,0.55)]",
                "bg-gradient-to-b from-amber-400 via-orange-500 to-orange-700",
                "hover:from-amber-300 hover:via-orange-400 hover:to-orange-600",
                "focus-visible:ring-2 focus-visible:ring-amber-400/50"
              )}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/55">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
