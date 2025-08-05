import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ConfigurableSection {
  id: string;
  section_type: string;
  column_headers: any;
  created_at: string;
  updated_at: string;
}

export interface ConfigurableSectionRow {
  id: string;
  section_id: string;
  row_data: any;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useConfigurableSection = (sectionType: 'bizdev' | 'brand' | 'product') => {
  return useQuery({
    queryKey: ["configurableSection", sectionType],
    queryFn: async (): Promise<{ section: ConfigurableSection; rows: ConfigurableSectionRow[] }> => {
      // Get the section
      const { data: section, error: sectionError } = await supabase
        .from("configurable_sections")
        .select("*")
        .eq("section_type", sectionType)
        .single();

      if (sectionError) {
        console.error("Error fetching configurable section:", sectionError);
        throw sectionError;
      }

      // Get the rows for this section
      const { data: rows, error: rowsError } = await supabase
        .from("configurable_section_rows")
        .select("*")
        .eq("section_id", section.id)
        .order("order_index", { ascending: true });

      if (rowsError) {
        console.error("Error fetching section rows:", rowsError);
        throw rowsError;
      }

      return {
        section: {
          ...section,
          column_headers: Array.isArray(section.column_headers) ? section.column_headers : [],
        },
        rows: (rows || []).map(row => ({
          ...row,
          row_data: typeof row.row_data === 'object' && row.row_data !== null ? row.row_data : {},
        })),
      };
    },
  });
};

export const useUpdateSectionHeaders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, headers }: { sectionId: string; headers: string[] }) => {
      const { error } = await supabase
        .from("configurable_sections")
        .update({ column_headers: headers })
        .eq("id", sectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurableSection"] });
    },
  });
};

export const useAddSectionRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, rowData, orderIndex }: { 
      sectionId: string; 
      rowData: Record<string, string>; 
      orderIndex: number; 
    }) => {
      const { error } = await supabase
        .from("configurable_section_rows")
        .insert({
          section_id: sectionId,
          row_data: rowData,
          order_index: orderIndex,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurableSection"] });
    },
  });
};

export const useUpdateSectionRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rowId, rowData }: { rowId: string; rowData: Record<string, string> }) => {
      const { error } = await supabase
        .from("configurable_section_rows")
        .update({ row_data: rowData })
        .eq("id", rowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurableSection"] });
    },
  });
};

export const useDeleteSectionRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rowId: string) => {
      const { error } = await supabase
        .from("configurable_section_rows")
        .delete()
        .eq("id", rowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurableSection"] });
    },
  });
};