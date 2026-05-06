import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import joyLogo from "@/src/assets/joy-logo.jpeg";

export function AppLayout() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Painel", path: "/" },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 relative",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-brand-primary hover:border-brand-primary/30 shadow-sm z-10 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="h-16 flex items-center px-6 border-b border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 text-brand-primary font-semibold text-lg tracking-tight min-w-max">
            <img
              src={joyLogo}
              alt="Joy Eventos"
              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
            />
            {!isCollapsed && <span>Orçamentos</span>}
          </div>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  isCollapsed && "justify-center px-0",
                )
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          {currentUser && !isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sair" : undefined}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              isCollapsed && "justify-center px-0",
            )}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
