import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { slugify } from "@/lib/slugify"

export interface Partner {
    id: string;
    name: string;
    slug?: string | null;
}

export function useAllPartners() {
  const [data, setData] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: rows, error: err } = await supabase
          .from("partners")
          .select("id, name")
          .eq("active", "true")
          .order("name", { ascending: true });
        if (err) throw err;
        if (!cancelled) {
          setData(
            rows.map((p) => ({
              id: p.id,
              name: p.name,
              slug: slugify(p.name),
            }))
          );
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
  }, []);

  return { data, isLoading, error };
}
