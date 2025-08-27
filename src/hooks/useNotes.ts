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

const currentYear = new Date().getFullYear();

export const useNotes = (
  partnerId: string,
  weekNumber: number,
  yearNum: number = currentYear
) => {
  return useQuery({
    queryKey: ["notes", partnerId, weekNumber, yearNum],
    queryFn: async (): Promise<Note | null> => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, partner_id, week_number, year_num, content, created_at, updated_at")
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
    enabled: Boolean(partnerId) && Boolean(weekNumber),
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
      yearNum = currentYear,
      content,
    }: {
      partnerId: string;
      weekNumber: number;
      yearNum?: number;
      content: string;
    }): Promise<Note> => {
      const payload = {
        partner_id: partnerId,
        week_number: weekNumber,
        year_num: yearNum,
        content,
      };

      const { data, error } = await supabase
        .from("notes")
        .upsert(payload, { onConflict: "partner_id,week_number,year_num" })
        .select("id, partner_id, week_number, year_num, content, created_at, updated_at")
        .single();

      if (error) {
        console.error("Error saving note:", error);
        throw error;
      }

      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", data.partner_id, data.week_number, data.year_num],
      });
      queryClient.invalidateQueries({
        queryKey: ["notesHistory", data.partner_id, data.year_num],
      });
    },
  });
};
