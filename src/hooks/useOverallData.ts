import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OverallWeeklyMetrics {
  week_num: number;
  year_num: number;
  appts_ocd_actual: number;
  appts_ocd_bizplan: number;
  appts_lcd_actual: number;
  appts_lcd_bizplan: number;
  cpa_actual: number;
  cpa_bizplan: number;
  costs_actual: number;
  costs_bizplan: number;
}

export const useOverallData = () => {
  return useQuery({
    queryKey: ["overallData"],
    queryFn: async (): Promise<OverallWeeklyMetrics[]> => {
      const { data, error } = await supabase
        .from('all_data' as any)
        .select('*')
        .order('week_num', { ascending: true });
          
      if (error) {
        console.error("Error fetching overall data:", error);
        throw error;
      }
      
      return (data || []).map((row: any) => ({
        week_num: row.week_num || 0,
        year_num: row.year_num || 0,
        appts_ocd_actual: row.appts_ocd_actual || 0,
        appts_ocd_bizplan: row.appts_ocd_bizplan || 0,
        appts_lcd_actual: row.appts_lcd_actual || 0,
        appts_lcd_bizplan: row.appts_lcd_bizplan || 0,
        cpa_actual: row.cpa_actual || 0,
        cpa_bizplan: row.cpa_bizplan || 0,
        costs_actual: row.costs_actual || 0,
        costs_bizplan: row.costs_bizplan || 0
      }));
    },
  });
};