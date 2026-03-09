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
          "px-3 py-1 rounded-full text-sm transition-colors",
          active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-subtle backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-glass" />
            <div>
              <div className="text-sm font-semibold tracking-tight">DeskFlow</div>
              <div className="text-xs text-muted-foreground">Office desk booking</div>
            </div>
          </div>
          {user && (
            <nav className="flex items-center gap-2 text-sm">
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/reservations" label="My reservations" />
              {user.role === "admin" && <NavLink to="/admin" label="Admin" />}
            </nav>
          )}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden text-right text-xs sm:block">
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
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

