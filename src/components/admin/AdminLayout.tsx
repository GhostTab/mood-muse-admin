import { ReactNode, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Music, FileText, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", icon: AlertCircle, label: "Unmapped Moods", end: true },
    { to: "/admin/reports", icon: LayoutDashboard, label: "Reports" },
    { to: "/admin/users", icon: Users, label: "Users" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 justify-center">
            <img src="/Vector.png" alt="Logo" className="w-4 h-7" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 text-center">Moodify Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
