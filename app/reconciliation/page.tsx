import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import ReconciliationClient from "./ReconciliationClient";

export default async function ReconciliationPage() {
  const supabase = getSupabaseServerClient();

  // Gate access on the server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/reconciliation");

  // Server-side fetch (RLS sees the authenticated user)
  const [
    { data: summary },
    { data: matched },
    { data: unmatched },
  ] = await Promise.all([
    supabase.from("v_reconciliation_summary").select("*").maybeSingle(),
    supabase
      .from("transactions")
      .select("id, ta_name, trx_id, property_address, agent_name, office_name, ta_notes, lead_notes, lead_name, last_updated, gci")
      .order("last_updated", { ascending: false })
      .order("trx_id", { ascending: true })
      .limit(200),
    supabase
      .from("unmatched_trx_data")
      .select("*")
      .order("trx_id", { ascending: true })
      .limit(200),
  ]);

  return (
    <ReconciliationClient
      initialSummary={summary ?? null}
      initialMatched={matched ?? []}
      initialUnmatched={unmatched ?? []}
    />
  );
}