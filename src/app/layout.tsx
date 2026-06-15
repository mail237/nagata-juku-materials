import type { Metadata } from "next";
import { AppDataProvider } from "@/components/providers/AppDataProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "永田塾 教材配布管理",
  description: "生徒への教材配布日・支払い状況を記録・確認する管理ツール",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}
