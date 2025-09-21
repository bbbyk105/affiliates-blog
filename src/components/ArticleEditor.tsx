"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ArticleEditorProps {
  article: {
    title: string;
    content: string;
    summary: string;
    keywords?: string[];
  };
  onSave?: (data: {
    title: string;
    content: string;
    summary: string;
    keywords: string[];
  }) => void;
  readOnly?: boolean;
}

export function ArticleEditor({
  article,
  onSave,
  readOnly = false,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [summary, setSummary] = useState(article.summary);
  const keywords = article.keywords || [];

  const handleSave = () => {
    if (onSave) {
      onSave({ title, content, summary, keywords });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>記事情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readOnly}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="summary">メタディスクリプション</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={readOnly}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>キーワード</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>記事本文</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={readOnly}
            className="min-h-[500px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {!readOnly && onSave && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            保存する
          </Button>
        </div>
      )}
    </div>
  );
}
