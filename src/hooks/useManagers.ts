import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Manager {
  id: string;
  name: string;
  color: string;
}

export interface ManagerWithPartners extends Manager {
  partners: Array<{
    id: string;
    name: string;
  }>;
}

export function useManagers() {
  const [data, setData] = useState<ManagerWithPartners[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: mgrs, error: mgrErr } = await supabase
          .from("managers")
          .select("*")
          .order("name", { ascending: true });
        if (mgrErr) throw mgrErr;

        const { data: rels, error: relErr } = await supabase
          .from("partner_managers")
          .select(`
            manager,
            partners!inner(id, name)
          `);
        if (relErr) throw relErr;

        const result = mgrs.map((m) => ({
          ...m,
          partners: rels
            .filter((r) => r.manager === m.id)
            .flatMap((r) =>
              r.partners.map((p) => ({ id: p.id, name: p.name }))
            ),
        }))


        if (!cancelled) setData(result);
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
