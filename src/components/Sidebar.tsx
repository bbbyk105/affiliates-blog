"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Settings,
  Plus,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "ホーム", href: "/dashboard", icon: Home },
  { name: "記事一覧", href: "/articles", icon: FileText },
  { name: "アナリティクス", href: "/analytics", icon: BarChart3 },
  { name: "設定", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* ロゴ */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Blogify
            </h1>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}

        {/* アクションボタン */}
        <div className="pt-6 space-y-2">
          <Button className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            <Plus className="mr-3 h-4 w-4" />
            新規スクレイピング
          </Button>
        </div>
      </nav>

      {/* ユーザーセクション */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              管理者
            </p>
            <p className="text-xs text-slate-500 truncate">
              byakkokondo@gmail.com
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
  );
}
