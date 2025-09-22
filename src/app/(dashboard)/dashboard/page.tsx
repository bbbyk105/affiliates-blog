"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Send,
  TrendingUp,
  RefreshCw,
  Clock,
  BarChart3,
  Zap,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";

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
  const [processingArticles, setProcessingArticles] = useState<Set<string>>(
    new Set()
  );

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

  const handleGenerate = async (articleId: string) => {
    setProcessingArticles((prev) => new Set(prev).add(articleId));
    try {
      const response = await fetch("/api/articles/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to generate blog post:", error);
    } finally {
      setProcessingArticles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  const handlePublish = async (articleId: string) => {
    setProcessingArticles((prev) => new Set(prev).add(articleId));
    try {
      const response = await fetch("/api/articles/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to publish article:", error);
    } finally {
      setProcessingArticles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  const stats = {
    pendingArticles: data.scrapedArticles.filter((a) => a.status === "pending")
      .length,
    draftArticles: data.generatedArticles.filter((a) => a.status === "draft")
      .length,
    publishedArticles: data.generatedArticles.filter(
      (a) => a.status === "published"
    ).length,
    totalArticles: data.scrapedArticles.length + data.generatedArticles.length,
  };

  const currentTime = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Content Dashboard
              </h1>
              <p className="text-purple-200 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {currentTime}
              </p>
            </div>
            <Button
              onClick={fetchData}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              更新
            </Button>
          </div>

          {/* クイック統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <div className="text-sm text-purple-200">総記事数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.pendingArticles}</div>
              <div className="text-sm text-purple-200">処理待ち</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">{stats.draftArticles}</div>
              <div className="text-sm text-purple-200">下書き</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold">
                {stats.publishedArticles}
              </div>
              <div className="text-sm text-purple-200">公開済み</div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細統計カード */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              未処理記事
            </CardTitle>
            <div className="rounded-full p-2 bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.pendingArticles}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                AI生成待ち
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              生成記事
            </CardTitle>
            <div className="rounded-full p-2 bg-purple-500/10">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.draftArticles}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-purple-600" />
              <p className="text-xs text-purple-600 dark:text-purple-400">
                公開準備中
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              公開済み
            </CardTitle>
            <div className="rounded-full p-2 bg-green-500/10">
              <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.publishedArticles}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 dark:text-green-400">
                microCMS配信中
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              総パフォーマンス
            </CardTitle>
            <div className="rounded-full p-2 bg-orange-500/10">
              <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {Math.round(
                (stats.publishedArticles / Math.max(stats.totalArticles, 1)) *
                  100
              )}
              %
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-orange-600" />
              <p className="text-xs text-orange-600 dark:text-orange-400">
                公開成功率
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の未処理記事 */}
      {stats.pendingArticles > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
              処理待ち記事
            </h2>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {stats.pendingArticles}件
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.scrapedArticles
              .filter((article) => article.status === "pending")
              .slice(0, 6)
              .map((article) => (
                <div key={article.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative">
                    <ArticleCard
                      article={article}
                      type="scraped"
                      onGenerate={handleGenerate}
                    />
                    {processingArticles.has(article.id) && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <div className="text-center space-y-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                            <Sparkles className="h-6 w-6 animate-pulse text-primary mx-auto" />
                          </div>
                          <p className="text-sm font-medium text-primary">
                            AI生成中...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 最近の下書き記事 */}
      {stats.draftArticles > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
              公開準備中
            </h2>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {stats.draftArticles}件
            </Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.generatedArticles
              .filter((article) => article.status === "draft")
              .slice(0, 6)
              .map((article) => (
                <div key={article.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <div className="relative">
                    <ArticleCard
                      article={article}
                      type="generated"
                      onPublish={handlePublish}
                    />
                    {processingArticles.has(article.id) && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <div className="text-center space-y-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                            <Send className="h-6 w-6 animate-pulse text-primary mx-auto" />
                          </div>
                          <p className="text-sm font-medium text-primary">
                            公開中...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 記事が何もない場合 */}
      {stats.totalArticles === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
          <CardContent className="text-center py-16">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-600 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                コンテンツを待機中
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                自動収集システムが稼働中です。新しいニュースが見つかり次第、AI生成プロセスが開始されます。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
