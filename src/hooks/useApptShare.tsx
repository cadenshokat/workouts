import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CurrentWeek = { week_num: number; year_num: number } | null;

type PartnerWeekRow = {
  partner: string;
  week_num: number;
  year_num: number;
  appts_ocd_actual: number | null;
};

export function useApptShare(currentWeek: CurrentWeek) {
  const [shareData, setShareData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!currentWeek) {
      setShareData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: rows = [], error: qErr } = await supabase
          .from("partner_data")
          .select("partner, week_num, year_num, appts_ocd_actual")
          .eq("week_num", currentWeek.week_num - 3)
          .eq("year_num", currentWeek.year_num);

        if (cancelled) return;

        if (qErr) {
          setError(qErr);
          setIsLoading(false);
          return;
        }

        const mapped = (rows as PartnerWeekRow[])
          .map(r => ({ name: r.partner, value: Math.max(0, r.appts_ocd_actual ?? 0) }))
          .filter(s => s.value > 0)
          .sort((a, b) => b.value - a.value);

        setShareData(mapped);
        setIsLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e);
          setIsLoading(false);
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [currentWeek?.week_num, currentWeek?.year_num]);

  return { shareData, error, isLoading };
}
