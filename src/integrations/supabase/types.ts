export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      configurable_section_rows: {
        Row: {
          created_at: string
          id: string
          order_index: number
          row_data: Json
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          row_data?: Json
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          row_data?: Json
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configurable_section_rows_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "configurable_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      configurable_sections: {
        Row: {
          column_headers: Json
          created_at: string
          id: string
          section_type: string
          updated_at: string
        }
        Insert: {
          column_headers?: Json
          created_at?: string
          id?: string
          section_type: string
          updated_at?: string
        }
        Update: {
          column_headers?: Json
          created_at?: string
          id?: string
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      levers: {
        Row: {
          confidence: number
          created_at: string
          description: string
          id: string
          impact: number
          net_impact: number | null
          partner_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          description: string
          id?: string
          impact?: number
          net_impact?: number | null
          partner_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          impact?: number
          net_impact?: number | null
          partner_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "levers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
        }
        Relationships: []
      }
      master: {
        Row: {
          date: string
          metric: number
          metric_name: string
          partner: string
        }
        Insert: {
          date: string
          metric: number
          metric_name: string
          partner: string
        }
        Update: {
          date?: string
          metric?: number
          metric_name?: string
          partner?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          partner_id: string
          updated_at: string
          week_number: number
          year_num: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          partner_id: string
          updated_at?: string
          week_number: number
          year_num?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          partner_id?: string
          updated_at?: string
          week_number?: number
          year_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "notes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_managers: {
        Row: {
          manager: string
          partner: string
        }
        Insert: {
          manager: string
          partner: string
        }
        Update: {
          manager?: string
          partner?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_managers_manager_fkey"
            columns: ["manager"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_managers_partner_fkey"
            columns: ["partner"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_metrics: {
        Row: {
          appts_actual: number | null
          appts_bizplan: number | null
          cpa_actual: number | null
          cpa_bizplan: number | null
          cpl_actual: number | null
          cpl_bizplan: number | null
          created_at: string
          date: string | null
          id: string
          partner_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          appts_actual?: number | null
          appts_bizplan?: number | null
          cpa_actual?: number | null
          cpa_bizplan?: number | null
          cpl_actual?: number | null
          cpl_bizplan?: number | null
          created_at?: string
          date?: string | null
          id?: string
          partner_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          appts_actual?: number | null
          appts_bizplan?: number | null
          cpa_actual?: number | null
          cpa_bizplan?: number | null
          cpl_actual?: number | null
          cpl_bizplan?: number | null
          created_at?: string
          date?: string | null
          id?: string
          partner_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      },
      partner_data_base: {
        Row: {
          id: string,
          partner: string,
          year_num: string,
          week_num: string,
          iso_week: string,
          appts_lcd_actaul: number,
          appts_lcd_bizplan: number,
          appts_ocd_actual: number,
          appts_ocd_bizplan: number,
          cpa_actual: number,
          cpa_bizplan: number,
          cpl_actual: number,
          cpl_bizplan: number,
          cr2_actual: number,
          cr2_bizplan: number,
          costs_actual: number,
          costs_bizplan: number,
          leads_actual: number,
          leads_bizplan: number
        }
      },
      partner_data_override: {
        id: string,
        appts_lcd_actaul: number,
        appts_lcd_bizplan: number,
        appts_ocd_actual: number,
        appts_ocd_bizplan: number,
        cpa_actual: number,
        cpa_bizplan: number,
        cpl_actual: number,
        cpl_bizplan: number,
        cr2_actual: number,
        cr2_bizplan: number,
        costs_actual: number,
        costs_bizplan: number,
        leads_actual: number,
        leads_bizplan: number
      }
    }
    Views: {
      all_data: {
        Row: {
          appts_lcd_actual: number | null
          appts_lcd_bizplan: number | null
          appts_ocd_actual: number | null
          appts_ocd_bizplan: number | null
          costs_actual: number | null
          costs_bizplan: number | null
          cpa_actual: number | null
          cpa_bizplan: number | null
          cpl_actual: number | null
          cpl_bizplan: number | null
          cr2_actual: number | null
          cr2_bizplan: number | null
          iso_week: string | null
          leads_actual: number | null
          leads_bizplan: number | null
          week_num: number | null
          year_num: number | null
        }
        Relationships: []
      }
      partner_data: {
        Row: {
          id: string
          appts_lcd_actual: number | null
          appts_lcd_bizplan: number | null
          appts_ocd_actual: number | null
          appts_ocd_bizplan: number | null
          costs_actual: number | null
          costs_bizplan: number | null
          cpa_actual: number | null
          cpa_bizplan: number | null
          cpl_actual: number | null
          cpl_bizplan: number | null
          cr2_actual: number | null
          cr2_bizplan: number | null
          iso_week: string | null
          leads_actual: number | null
          leads_bizplan: number | null
          partner: string | null
          week_num: number | null
          year_num: number | null
        }
        Relationships: []
      },
      partner_data_view: {
        id: string,
        partner: string,
        year_num: string,
        week_num: string,
        iso_week: string,
        appts_lcd_actaul: number,
        appts_lcd_bizplan: number,
        appts_ocd_actual: number,
        appts_ocd_bizplan: number,
        cpa_actual: number,
        cpa_bizplan: number,
        cpl_actual: number,
        cpl_bizplan: number,
        cr2_actual: number,
        cr2_bizplan: number,
        costs_actual: number,
        costs_bizplan: number,
        leads_actual: number,
        leads_bizplan: number
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
