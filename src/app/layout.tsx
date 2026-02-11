import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ProfitLens", description: "コンサルティング事業向けプロジェクト収益管理" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ja"><head><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet" /></head><body className="bg-slate-50 text-slate-900 antialiased">{children}</body></html>);
}
