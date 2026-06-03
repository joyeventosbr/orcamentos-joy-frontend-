import joyLogo from "@/src/assets/joy-logo.png";
import { PageLoader } from "@/src/components/ui/PageLoader/PageLoader";
import { useAppData } from "@/src/context/AppDataContext";
import { useAuth } from "@/src/hooks/use-auth";
import { usePermissions } from "@/src/hooks/use-permissions";
import { cn } from "@/src/lib/utils";
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Settings, Shield, Users } from "lucide-react";
import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const MAIN_NAV: NavItem[] = [{ icon: LayoutDashboard, label: "Painel", path: "/" }];

const ADMIN_NAV: NavItem[] = [
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

function NavItemLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  return (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === "/"}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          isCollapsed && "justify-center px-0",
        )
      }
    >
      <item.icon size={18} className="shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuth();
  const { isAdmin } = usePermissions();
  const { isLoading: isAppDataLoading } = useAppData();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDashboard = pathname === "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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

        <div className="h-16 flex items-center justify-center border-b border-gray-100 overflow-hidden px-4">
          <img src={joyLogo} alt="Joy Eventos" className={cn("object-contain", isCollapsed ? "h-6" : "h-9")} />
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
          )}
          {MAIN_NAV.map((item) => (
            <NavItemLink key={item.path} item={item} isCollapsed={isCollapsed} />
          ))}

          {isAdmin && (
            <>
              <div className={cn("mt-4 mb-2", isCollapsed ? "border-t border-gray-100 pt-4" : "")}>
                {!isCollapsed && (
                  <div className="px-3 mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <Shield size={11} />
                    Administração
                  </div>
                )}
              </div>
              {ADMIN_NAV.map((item) => (
                <NavItemLink key={item.path} item={item} isCollapsed={isCollapsed} />
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          {currentUser && !isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                {isAdmin && <Shield size={11} className="text-brand-primary shrink-0" />}
              </div>
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
      <main className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
        {isDashboard && isAppDataLoading && (
          <PageLoader className="absolute inset-0 z-10 bg-gray-50/50" />
        )}
      </main>
    </div>
  );
}
