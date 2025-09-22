import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン済みならダッシュボードへ、未ログインならログインページへ
  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
