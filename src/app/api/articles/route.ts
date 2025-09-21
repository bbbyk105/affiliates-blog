import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // スクレイピングした記事と生成された記事を取得
    const { data: scrapedArticles, error: scrapedError } = await supabase
      .from("scraped_articles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: generatedArticles, error: generatedError } = await supabase
      .from("generated_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (scrapedError || generatedError) {
      throw scrapedError || generatedError;
    }

    return NextResponse.json({
      scrapedArticles: scrapedArticles || [],
      generatedArticles: generatedArticles || [],
    });
  } catch (error) {
    console.error("Fetch articles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
