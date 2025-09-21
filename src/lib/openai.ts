import OpenAI from "openai";
import { NewsArticle, AffiliateLink } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BlogPostResponse {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
}

interface AffiliateProduct {
  productName: string;
  provider: "amazon" | "rakuten";
  position: number;
}

interface AffiliateResponse {
  products: AffiliateProduct[];
}

export async function generateBlogPost(newsArticle: NewsArticle) {
  const prompt = `
あなたはプロのブログライターです。以下のニュース記事を元に、オリジナルのブログ記事を作成してください。

【ニュース記事】
タイトル: ${newsArticle.title}
内容: ${newsArticle.description}
URL: ${newsArticle.url}

【要件】
1. ニュース記事の内容を直接コピーせず、独自の視点と感想を加えて執筆
2. SEOを意識したタイトルと見出し構成
3. 読者に価値を提供する内容
4. 1500-2000文字程度
5. Markdown形式で出力
6. メタディスクリプション(120文字以内)も含める
7. 関連キーワードを5-10個抽出

【出力形式】
{
  "title": "SEO最適化されたタイトル",
  "content": "Markdown形式の本文",
  "summary": "メタディスクリプション",
  "keywords": ["キーワード1", "キーワード2", ...]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "あなたは経験豊富なSEOライターです。オリジナリティのある魅力的なブログ記事を作成します。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const result: BlogPostResponse = JSON.parse(
    completion.choices[0].message.content || "{}"
  );

  // アフィリエイトリンクの自動判定と挿入
  const affiliateLinks = await detectAffiliateOpportunities(
    result.content,
    result.keywords
  );

  return {
    ...result,
    affiliateLinks,
  };
}

async function detectAffiliateOpportunities(
  content: string,
  keywords: string[]
): Promise<AffiliateLink[]> {
  const prompt = `
以下のブログ記事とキーワードから、アフィリエイト商品を提案してください。

【記事内容】
${content.substring(0, 500)}...

【キーワード】
${keywords.join(", ")}

【要件】
1. 記事の文脈に自然に合う商品を3-5個提案
2. Amazon/楽天で実際に販売されていそうな商品名を提案
3. 記事内の適切な挿入位置を指定

【出力形式】
{
  "products": [
    {
      "productName": "商品名",
      "provider": "amazon" or "rakuten",
      "position": 記事内の段落番号(0から開始)
    }
  ]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const result: AffiliateResponse = JSON.parse(
    completion.choices[0].message.content || "{}"
  );

  return (result.products || []).map(
    (product: AffiliateProduct, index: number) => ({
      productName: product.productName,
      url: generateAffiliateUrl(product.productName, product.provider),
      provider: product.provider,
      position: product.position || index,
    })
  );
}

function generateAffiliateUrl(productName: string, provider: string): string {
  const encodedProduct = encodeURIComponent(productName);

  if (provider === "amazon") {
    return `https://www.amazon.co.jp/s?k=${encodedProduct}&tag=${process.env.AFFILIATE_AMAZON_TAG}`;
  } else if (provider === "rakuten") {
    return `https://search.rakuten.co.jp/search/mall/${encodedProduct}/?scid=${process.env.AFFILIATE_RAKUTEN_ID}`;
  }

  return "#";
}

// アフィリエイトリンクを記事に挿入
export function insertAffiliateLinks(
  content: string,
  affiliateLinks: AffiliateLink[]
): string {
  const paragraphs = content.split("\n\n");

  affiliateLinks.forEach((link) => {
    const position = Math.min(link.position, paragraphs.length - 1);
    const affiliateHtml = `\n\n<div class="affiliate-link">
  <a href="${link.url}" target="_blank" rel="nofollow noopener noreferrer">
    📦 ${link.productName}をチェック
  </a>
</div>\n\n`;

    paragraphs[position] += affiliateHtml;
  });

  return paragraphs.join("\n\n");
}
