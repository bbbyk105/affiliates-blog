import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { publishToMicroCMS } from "@/lib/microcms";

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();
    const supabase = await createServerSupabaseClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 生成された記事を取得
    const { data: generatedArticle, error: fetchError } = await supabase
      .from("generated_articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (fetchError || !generatedArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // microCMSに公開
    const microCMSArticle = {
      title: generatedArticle.title,
      content: generatedArticle.content,
      summary: generatedArticle.summary,
      tags: generatedArticle.keywords || [],
    };

    const publishedArticle = await publishToMicroCMS(microCMSArticle);

    // ステータスを更新
    const { error: updateError } = await supabase
      .from("generated_articles")
      .update({
        status: "published",
        microcms_id: publishedArticle.id,
        published_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      microCMSArticle: publishedArticle,
    });
  } catch (error) {
    console.error("Publishing error:", error);
    return NextResponse.json(
      { error: "Failed to publish article" },
      { status: 500 }
    );
  }
}
