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

        if (!cancelled) setData(mgrs);
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
