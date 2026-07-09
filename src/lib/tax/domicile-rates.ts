import type { SupabaseClient } from "@supabase/supabase-js";

export interface DomicileRates {
  defaultWithholdingRate: number | null;
  treatyCreditRate: number | null;
}

export async function getDomicileRates(
  supabase: SupabaseClient,
  domicile: string | null,
): Promise<DomicileRates> {
  if (!domicile) {
    return { defaultWithholdingRate: null, treatyCreditRate: null };
  }

  const { data } = await supabase
    .from("domicile_tax_rules")
    .select("default_withholding_rate, treaty_credit_rate")
    .eq("domicile", domicile)
    .maybeSingle();

  return {
    defaultWithholdingRate: data?.default_withholding_rate ?? null,
    treatyCreditRate: data?.treaty_credit_rate ?? null,
  };
}
