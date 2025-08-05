import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  partner_id: string;
  week_number: number;
  year_num: number;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const useNotes = (partnerId: string, weekNumber: number, yearNum: number = 2025) => {
  return useQuery({
    queryKey: ["notes", partnerId, weekNumber, yearNum],
    queryFn: async (): Promise<Note | null> => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("partner_id", partnerId)
        .eq("week_number", weekNumber)
        .eq("year_num", yearNum)
        .maybeSingle();

      if (error) {
        console.error("Error fetching note:", error);
        throw error;
      }

      return data;
    },
    enabled: !!partnerId && !!weekNumber,
    staleTime: Infinity,           
    refetchOnWindowFocus: false,   
    refetchOnReconnect: false,  
    refetchOnMount: false,
  });
};

export const useSaveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partnerId,
      weekNumber,
      yearNum = 2024,
      content,
    }: {
      partnerId: string;
      weekNumber: number;
      yearNum?: number;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .upsert({
          partner_id: partnerId,
          week_number: weekNumber,
          year_num: yearNum,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving note:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", data.partner_id, data.week_number, data.year_num],
      });
    },
  });
};