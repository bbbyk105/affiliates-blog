"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArticleEditor } from "@/components/ArticleEditor";
import { ArrowLeft, Send, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ArticleDetailProps {
  params: Promise<{ id: string }>;
}

interface ArticleDetail {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  description?: string;
  keywords?: string[];
  status: string;
  url?: string;
  image_url?: string;
  created_at: string;
  published_at?: string;
  source?: string;
  type: "scraped" | "generated";
}

export default function ArticleDetailPage({ params }: ArticleDetailProps) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  // paramsを解決
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const fetchArticle = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setIsLoading(true);

      // まず生成記事を確認
      let response = await fetch(
        `/api/articles/generated/${resolvedParams.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setArticle({
          ...data,
          type: "generated",
        });
        return;
      }

      // 次にスクレイピング記事を確認
      response = await fetch(`/api/articles/scraped/${resolvedParams.id}`);

      if (response.ok) {
        const data = await response.json();
        setArticle({
          ...data,
          type: "scraped",
        });
        return;
      }

      setError("記事が見つかりません");
    } catch {
      setError("記事の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handlePublish = async () => {
    if (!article || article.type !== "generated") return;

    setIsPublishing(true);
    try {
      const response = await fetch("/api/articles/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId: article.id }),
      });

      if (response.ok) {
        await fetchArticle(); // データを再取得
      } else {
        setError("公開に失敗しました");
      }
    } catch {
      setError("公開に失敗しました");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGenerate = async () => {
    if (!article || article.type !== "scraped") return;

    try {
      const response = await fetch("/api/articles/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId: article.id }),
      });

      if (response.ok) {
        router.push("/articles");
      } else {
        setError("ブログ生成に失敗しました");
      }
    } catch {
      setError("ブログ生成に失敗しました");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    generated: "bg-blue-100 text-blue-800",
    draft: "bg-purple-100 text-purple-800",
    published: "bg-green-100 text-green-800",
  };

  const statusText = {
    pending: "未処理",
    generated: "生成済み",
    draft: "下書き",
    published: "公開済み",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "記事が見つかりません"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            className={
              statusColors[article.status as keyof typeof statusColors]
            }
          >
            {statusText[article.status as keyof typeof statusText]}
          </Badge>

          {article.type === "scraped" && article.status === "pending" && (
            <Button onClick={handleGenerate}>ブログを生成</Button>
          )}

          {article.type === "generated" && article.status === "draft" && (
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? "公開中..." : "公開する"}
            </Button>
          )}

          {article.url && (
            <Button variant="outline" size="icon" asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* 記事情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>作成日: {formatDate(article.created_at)}</span>
                {article.published_at && (
                  <span>公開日: {formatDate(article.published_at)}</span>
                )}
                {article.source && <span>ソース: {article.source}</span>}
              </div>
            </div>
          </div>
        </CardHeader>

        {article.image_url && (
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 記事内容 */}
      {article.type === "scraped" && (
        <Card>
          <CardHeader>
            <CardTitle>元記事の概要</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {article.description || "No description available"}
            </p>
          </CardContent>
        </Card>
      )}

      {article.type === "generated" && article.content && (
        <ArticleEditor
          article={{
            title: article.title,
            content: article.content,
            summary: article.summary || "",
            keywords: article.keywords || [],
          }}
          readOnly
        />
      )}
    </div>
  );
}
