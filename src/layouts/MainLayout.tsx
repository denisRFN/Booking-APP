import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { logout } from "../services/auth";
import { cn } from "../lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setUser(null);
  };
  const userInitials = getInitials(user?.name, user?.email);

  const NavLink = ({ to, label }: { to: string; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/15 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-background via-secondary/70 to-background">
      <div className="mx-auto flex min-h-screen min-h-dvh max-w-7xl flex-col px-4 py-6">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-card/90 px-5 py-3.5 shadow-subtle backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-glow" />
            <div className="min-w-0">
              <div className="font-display text-lg font-bold tracking-tight text-foreground">DeskFlow</div>
              <div className="text-xs text-muted-foreground">Office desk booking</div>
            </div>
          </div>
          {user && (
            <nav className="flex items-center gap-1.5 text-sm">
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/reservations" label="My reservations" />
              {user.role === "admin" && <NavLink to="/admin" label="Admin" />}
            </nav>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user && (
              <>
                <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-md shadow-blue-900/25 sm:flex">
                  {userInitials}
                </div>
                <div className="hidden text-right text-xs sm:block">
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="truncate max-w-[160px] text-muted-foreground">{user.email}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto pb-4 md:max-h-[calc(100dvh-10rem)]">{children}</main>
        <footer className="mt-4 text-center text-xs text-muted-foreground">
          DeskFlow · Modern desk booking for hybrid teams
        </footer>
      </div>
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  const normalized = (name ?? "").trim();
  if (normalized) {
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  const localPart = (email ?? "").split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") ?? "";
  return (localPart.slice(0, 2) || "U").toUpperCase();
}

