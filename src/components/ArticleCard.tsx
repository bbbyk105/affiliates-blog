"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, ExternalLink } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description?: string;
    url?: string;
    image_url?: string;
    status: string;
    created_at: string;
  };
  type: "scraped" | "generated";
  onGenerate?: (id: string) => void;
  onPublish?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ArticleCard({
  article,
  type,
  onGenerate,
  onPublish,
  onView,
}: ArticleCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
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

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {article.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-2">
            {article.title}
          </h3>
          <Badge
            className={
              statusColors[article.status as keyof typeof statusColors]
            }
          >
            {statusText[article.status as keyof typeof statusText]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {article.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {truncateText(article.description, 150)}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {formatDate(article.created_at)}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2">
        {type === "scraped" && article.status === "pending" && onGenerate && (
          <Button
            onClick={() => handleAction(() => onGenerate(article.id))}
            disabled={isLoading}
            className="flex-1"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? "生成中..." : "ブログを生成"}
          </Button>
        )}

        {type === "generated" && article.status === "draft" && onPublish && (
          <Button
            onClick={() => handleAction(() => onPublish(article.id))}
            disabled={isLoading}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? "公開中..." : "公開する"}
          </Button>
        )}

        {onView && (
          <Button
            variant="outline"
            onClick={() => onView(article.id)}
            className="flex-1"
          >
            詳細を見る
          </Button>
        )}

        {article.url && (
          <Button variant="ghost" size="icon" asChild>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
