import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/app/sidebar";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Gas Manager - Quản lý nhập xuất gas",
  description: "Hệ thống quản lý nhập xuất gas, tồn kho và hóa đơn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} antialiased`}
    >
      <body className="min-h-screen bg-slate-50 text-base" style={{ fontFamily: 'var(--font-be-vietnam-pro), sans-serif' }}>
        <Sidebar />
        <div className="flex min-h-screen flex-col lg:ml-64">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-slate-200 bg-white lg:hidden">
            <div className="w-16 shrink-0" />{/* space for hamburger */}
            <span className="mx-auto text-sm font-bold text-slate-900 tracking-wide">GAS MANAGER</span>
            <div className="w-16 shrink-0" />
          </header>
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

