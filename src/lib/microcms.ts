import { createClient } from "microcms-js-sdk";
import { MicroCMSArticle } from "@/types";

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

export async function publishToMicroCMS(article: MicroCMSArticle) {
  try {
    const response = await client.create({
      endpoint: "articles",
      content: article,
    });
    return response;
  } catch (error) {
    console.error("Failed to publish to microCMS:", error);
    throw error;
  }
}

export async function updateMicroCMSArticle(
  id: string,
  article: Partial<MicroCMSArticle>
) {
  try {
    const response = await client.update({
      endpoint: "articles",
      contentId: id,
      content: article,
    });
    return response;
  } catch (error) {
    console.error("Failed to update microCMS article:", error);
    throw error;
  }
}

export async function getMicroCMSArticles() {
  try {
    const response = await client.getList({
      endpoint: "articles",
    });
    return response;
  } catch (error) {
    console.error("Failed to get microCMS articles:", error);
    throw error;
  }
}

export async function deleteMicroCMSArticle(id: string) {
  try {
    await client.delete({
      endpoint: "articles",
      contentId: id,
    });
  } catch (error) {
    console.error("Failed to delete microCMS article:", error);
    throw error;
  }
}
