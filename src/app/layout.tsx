import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Blog Generator",
  description: "ニュースを自動でブログ記事に変換するAIアプリケーション",
  keywords: ["AI", "ブログ", "アフィリエイト", "ニュース", "自動生成"],
  authors: [{ name: "AI Blog Generator" }],
  robots: "noindex, nofollow", // 管理画面なのでSEO除外
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
