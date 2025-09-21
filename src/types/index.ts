export interface NewsArticle {
  id: string;
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

export interface GeneratedBlogPost {
  id: string;
  newsArticleId: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  affiliateLinks: AffiliateLink[];
  status: "draft" | "pending" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  productName: string;
  url: string;
  provider: "amazon" | "rakuten";
  position: number; // 記事内の挿入位置
}

export interface MicroCMSArticle {
  id?: string;
  title: string;
  content: string;
  summary: string;
  eyecatch?: {
    url: string;
  };
  category?: string[];
  tags?: string[];
  publishedAt?: string;
}
