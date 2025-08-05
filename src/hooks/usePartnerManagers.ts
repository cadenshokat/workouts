import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PartnerManager {
  partner: string;
  manager: string;
  partner_name: string;
  manager_name: string;
  manager_color: string;
}

export function usePartnerManagers() {
  const [data, setData] = useState<PartnerManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("partner_managers")
          .select(`
            partner,
            manager,
            partners!inner(name),
            managers!inner(name, color)
          `);
        if (error) throw error;

        const formatted = rows.map((r) => ({
          partner: r.partner,
          manager: r.manager,
          partner_name: r.partners.name,
          manager_name: r.managers.name,
          manager_color: r.managers.color,
        }));

        if (!cancelled) setData(formatted);
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
