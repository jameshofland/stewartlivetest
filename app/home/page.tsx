import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import HomeClient from "./HomeClient";



export default async function Page() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/home");
  return <HomeClient />;
}