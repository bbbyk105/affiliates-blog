"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  scrapedArticles: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    image_url?: string;
    url?: string;
  }>;
  generatedArticles: Array<{
    id: string;
    title: string;
    content: string;
    summary: string;
    status: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    scrapedArticles: [],
    generatedArticles: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/articles");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    pendingArticles: data.scrapedArticles.filter((a) => a.status === "pending")
      .length,
    publishedArticles: data.generatedArticles.filter(
      (a) => a.status === "published"
    ).length,
    draftArticles: data.generatedArticles.filter((a) => a.status === "draft")
      .length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      {/* 統計カード */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              今日取得した記事数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.pendingArticles}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              公開済み記事数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.publishedArticles}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              下書き数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.draftArticles}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* トレンドチャート */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                記事公開トレンド
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">過去30日間</p>
            </div>
            <div className="text-green-600 font-semibold text-sm">+12%</div>
          </div>
        </CardHeader>
        <CardContent>
          {/* シンプルなトレンドチャートプレースホルダー */}
          <div className="h-48 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg relative overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 200"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 Q50,120 100,130 T200,110 T300,90 T400,70"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
              <path
                d="M0,150 Q50,120 100,130 T200,110 T300,90 T400,70 L400,200 L0,200 Z"
                fill="url(#gradient)"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* 最新の記事テーブル */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            最新の記事
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2">
              <div>タイトル</div>
              <div>公開日</div>
              <div>ステータス</div>
            </div>

            {data.generatedArticles.length > 0 ? (
              data.generatedArticles.map((article) => (
                <div
                  key={article.id}
                  className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 truncate">
                    {article.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(article.created_at).toLocaleDateString("ja-JP")}
                  </div>
                  <div>
                    <Badge
                      variant={
                        article.status === "published" ? "default" : "secondary"
                      }
                      className={
                        article.status === "published"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {article.status === "published" ? "公開" : "下書き"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                まだ記事がありません
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
