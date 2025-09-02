import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify, unslugify } from "@/lib/slugify";

export interface WeeklyMetrics {
  id: string
  week_num: number;
  partner: string;
  year_num: number;
  appts_ocd_actual: number;
  appts_ocd_bizplan: number;
  cpl_actual: number;
  cpl_bizplan: number;
  cpa_actual: number;
  cpa_bizplan: number;
}

export interface Lever {
  id: string;
  week_number: number;
  partner_id: string;
  description: string;
  impact: number;
  confidence: number;
  net_impact: number | null;
}

export interface PartnerData {
  partnerName: string;
  weeklyMetrics: WeeklyMetrics[];
  levers: Lever[];
}

interface Partner {
  name: string;
  slug: string;
}

export function useData(
  partnerSlug: string,
  partnerId?: string
) {
  const [data, setData] = useState<PartnerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!partnerSlug) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: partner } = await supabase
        .from('partners')
        .select('name, slug')
        .eq('slug', partnerSlug)

      const p = partner as Partner[]

      const { data: allMetrics = [], error: mErr } =
        await supabase
          .from("partner_data_view")
          .select("*")
          .eq("partner", `${p[0].name}`)
          .order("week_num", { ascending: true });
      if (mErr) throw mErr;

      const weeklyMetrics = allMetrics as WeeklyMetrics[];
      const partnerName = weeklyMetrics[0]?.partner ?? "Unknown Partner";

      let levers: Lever[] = [];
      if (partnerId) {
        const { data: lData = [], error: lErr } =
          await supabase
            .from("levers")
            .select("*")
            .eq("partner_id", partnerId)
            .order("week_number", { ascending: true });
        if (lErr) throw lErr;
        levers = lData;
      }

      setData({ partnerName, weeklyMetrics, levers });
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [partnerSlug, partnerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
