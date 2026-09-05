import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Brain,
  BarChart3,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  NavLink,
  Outlet,
} from "react-router-dom";

import { useState } from "react";

import {
  useTheme,
} from "../context/ThemeContext";

const menu = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    path: "/clientes",
    icon: Users,
  },
  {
    title: "Comentarios",
    path: "/comentarios",
    icon: MessageSquare,
  },
  {
    title: "Análisis NLP",
    path: "/nlp",
    icon: Brain,
  },
  {
    title: "Métricas",
    path: "/metricas",
    icon: BarChart3,
  },
  {
    title: "Optimización",
    path: "/optimizacion",
    icon: Settings,
  },
  {
    title: "Reportes",
    path: "/reportes",
    icon: FileText,
  },
];

export default function MainLayout() {
    const navigate = useNavigate();
    const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    };
    
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const { theme, toggleTheme } =
    useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">

      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-all
          duration-300
          dark:border-slate-800
          dark:bg-slate-900

          ${
            collapsed
              ? "w-20"
              : "w-64"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* LOGO */}
        <div className="flex h-20 items-center border-b border-slate-200 px-4 dark:border-slate-800">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Brain size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  Centro Inteligente
                </h1>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Gestión empresarial
                </p>
              </div>
            )}

          </div>

          <button
            onClick={() =>
              setMobileOpen(false)
            }
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          >
            <X size={19} />
          </button>

        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">

          <p
            className={`
              mb-3 px-3 pt-3
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
              ${
                collapsed
                  ? "text-center"
                  : ""
              }
            `}
          >
            {!collapsed
              ? "Principal"
              : "•••"}
          </p>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() =>
                  setMobileOpen(false)
                }
                title={
                  collapsed
                    ? item.title
                    : undefined
                }
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-medium
                  transition-all

                  ${
                    isActive
                      ? `
                        bg-blue-600
                        text-white
                        shadow-lg
                        shadow-blue-600/20
                      `
                      : `
                        text-slate-600
                        hover:bg-slate-100
                        hover:text-slate-900
                        dark:text-slate-400
                        dark:hover:bg-slate-800
                        dark:hover:text-white
                      `
                  }

                  ${
                    collapsed
                      ? "justify-center"
                      : ""
                  }
                  `
                }
              >
                <Icon
                  size={19}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span>
                    {item.title}
                  </span>
                )}
              </NavLink>
            );
          })}

        </nav>


        {/* CONFIGURACIÓN DEL SIDEBAR */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">

        <button
            onClick={() =>
            setCollapsed(!collapsed)
            }
            className="mb-2 hidden w-full items-center justify-center rounded-xl p-3 text-slate-500 hover:bg-slate-100 lg:flex dark:hover:bg-slate-800"
            title={
            collapsed
                ? "Expandir menú"
                : "Contraer menú"
            }
        >
            {collapsed ? (
            <ChevronRight size={18} />
            ) : (
            <ChevronLeft size={18} />
            )}
        </button>

        <button
            onClick={handleLogout}
            className={`
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-medium
            text-red-600
            transition-all
            hover:bg-red-50
            dark:text-red-400
            dark:hover:bg-red-950/30
            ${collapsed ? "justify-center" : ""}
            `}
            title={
            collapsed
                ? "Cerrar sesión"
                : undefined
            }
        >
            <LogOut
            size={19}
            className="shrink-0"
            />

            {!collapsed && (
            <span>
                Cerrar sesión
            </span>
            )}
        </button>

        </div>


      </aside>

      {/* CONTENIDO */}
      <div
        className={`
          transition-all
          duration-300
          ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }
        `}
      >

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">

          {/* MOBILE */}
          <button
            onClick={() =>
              setMobileOpen(true)
            }
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu size={21} />
          </button>

          {/* TÍTULO */}
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Panel administrativo
            </p>

            <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
              Centro Inteligente
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">

            {/* TEMA */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={
                theme === "light"
                  ? "Activar modo oscuro"
                  : "Activar modo claro"
              }
            >
              {theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            {/* USUARIO */}
            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Administrador
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ADMIN
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                AD
              </div>

            </div>

          </div>

        </header>

        {/* CONTENIDO DE CADA PÁGINA */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 px-8 py-5 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400">
            Centro Inteligente © 2026
          </p>
        </footer>

      </div>

    </div>
  );
}

