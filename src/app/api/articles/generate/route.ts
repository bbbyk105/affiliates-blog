import { NextRequest, NextResponse } from "next/server";
import { fetchLatestNews } from "@/lib/newsapi";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Vercel Cronの認証チェック
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 最新ニュースを取得
    const newsArticles = await fetchLatestNews("technology", 10);

    // Supabaseに保存
    const { data, error } = await supabase
      .from("scraped_articles")
      .insert(
        newsArticles.map((article) => ({
          news_id: article.id,
          title: article.title,
          description: article.description,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source: article.source.name,
          status: "pending",
        }))
      )
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      articlesScraped: data.length,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape articles" },
      { status: 500 }
    );
  }
}
