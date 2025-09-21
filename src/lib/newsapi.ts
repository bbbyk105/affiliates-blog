import { NewsArticle } from "@/types";

const NEWS_API_URL = "https://newsapi.org/v2";

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

interface NewsAPIResponse {
  articles: NewsAPIArticle[];
  status: string;
  totalResults: number;
}

export async function fetchLatestNews(
  category: string = "technology",
  pageSize: number = 10
): Promise<NewsArticle[]> {
  const response = await fetch(
    `${NEWS_API_URL}/top-headlines?country=jp&category=${category}&pageSize=${pageSize}&apiKey=${process.env.NEWSAPI_KEY}`,
    { next: { revalidate: 3600 } } // 1時間キャッシュ
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data: NewsAPIResponse = await response.json();
  return data.articles.map((article: NewsAPIArticle, index: number) => ({
    id: `news_${Date.now()}_${index}`,
    ...article,
  }));
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const response = await fetch(
    `${NEWS_API_URL}/everything?q=${encodeURIComponent(
      query
    )}&language=ja&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to search news");
  }

  const data: NewsAPIResponse = await response.json();
  return data.articles.map((article: NewsAPIArticle, index: number) => ({
    id: `news_${Date.now()}_${index}`,
    ...article,
  }));
}
