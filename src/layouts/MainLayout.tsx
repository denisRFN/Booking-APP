import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/auth";
import { cn } from "../lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    logout();
    setUser(null);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(30,14%,9%)] to-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
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
          <div className="flex shrink-0 items-center gap-3">
            {user && (
              <>
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
        <main className="flex-1 pb-4">{children}</main>
        <footer className="mt-4 text-center text-xs text-muted-foreground">
          DeskFlow · Modern desk booking for hybrid teams
        </footer>
      </div>
    </div>
  );
}

