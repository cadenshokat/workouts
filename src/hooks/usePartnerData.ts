import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

export interface WeeklyMetrics {
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

export function usePartnerData(
  partnerSlug: string,
  partnerId?: string
) {
  const [data, setData] = useState<PartnerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!partnerSlug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: allMetrics = [], error: mErr } =
          await supabase
            .from("partner_data")
            .select("*")
            .order("week_num", { ascending: true });
        if (mErr) throw mErr;

        const weeklyMetrics = allMetrics.filter((row) =>
          slugify(row.partner) === partnerSlug
        );

        const partnerName =
          weeklyMetrics[0]?.partner ?? "Unknown Partner";

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

        if (!cancelled) {
          setData({ partnerName, weeklyMetrics, levers });
        }
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [partnerSlug, partnerId]);

  return { data, isLoading, error };
}