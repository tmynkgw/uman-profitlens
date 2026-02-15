import type { Metadata } from "next";
import "./globals.css";

const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';
export const metadata: Metadata = {
  title: isDemo ? "ProfitLens - DEMO" : "ProfitLens",
  description: isDemo ? "コンサルティング事業向けプロジェクト収益管理（デモ版）" : "コンサルティング事業向けプロジェクト収益管理"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ja"><head><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet" /></head><body className="bg-slate-50 text-slate-900 antialiased">{children}</body></html>);
}
