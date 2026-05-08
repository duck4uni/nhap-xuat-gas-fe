"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageMinus,
  PackagePlus,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/nhap-gas", label: "Nhập Gas", icon: PackagePlus },
  { href: "/xuat-gas", label: "Xuất Gas", icon: PackageMinus },
  { href: "/ton-kho", label: "Tồn Kho", icon: Warehouse },
  { href: "/hoa-don", label: "Hóa Đơn", icon: FileText },
  { href: "/bao-cao", label: "Báo Cáo", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger button — mobile only, visible when sidebar is closed */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">GAS MANAGER</p>
              <p className="text-xs text-slate-400">Quản lý kho gas</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Menu chính
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-400 truncate">Quản trị viên</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
