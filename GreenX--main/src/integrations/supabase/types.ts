export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string
          check_out: string | null
          farm_id: string | null
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          farm_id?: string | null
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          farm_id?: string | null
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          created_at: string
          disease_risk: string | null
          expert_id: string
          farm_id: string
          id: string
          notes: string | null
          pest_risk: string | null
          prescription: string | null
        }
        Insert: {
          created_at?: string
          disease_risk?: string | null
          expert_id: string
          farm_id: string
          id?: string
          notes?: string | null
          pest_risk?: string | null
          prescription?: string | null
        }
        Update: {
          created_at?: string
          disease_risk?: string | null
          expert_id?: string
          farm_id?: string
          id?: string
          notes?: string | null
          pest_risk?: string | null
          prescription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_requests: {
        Row: {
          category: string
          created_at: string
          farm_id: string | null
          id: string
          item_name: string
          note: string | null
          quantity: string | null
          requested_by: string
          status: string
          urgency: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          farm_id?: string | null
          id?: string
          item_name: string
          note?: string | null
          quantity?: string | null
          requested_by: string
          status?: string
          urgency?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          farm_id?: string | null
          id?: string
          item_name?: string
          note?: string | null
          quantity?: string | null
          requested_by?: string
          status?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_requests_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_assignments: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_assignments_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          contract_summary: string | null
          created_at: string
          created_by: string | null
          crop: string | null
          crop_health_score: number | null
          expected_revenue: number | null
          growth_stage: string | null
          harvest_date: string | null
          id: string
          name: string
          pincode: string | null
          profit_share: number | null
          soil_moisture: number | null
          soil_nitrogen: number | null
          soil_organic_carbon: number | null
          soil_ph: number | null
          soil_phosphorus: number | null
          soil_potassium: number | null
          sowing_date: string | null
          total_land: number
          village: string
        }
        Insert: {
          contract_summary?: string | null
          created_at?: string
          created_by?: string | null
          crop?: string | null
          crop_health_score?: number | null
          expected_revenue?: number | null
          growth_stage?: string | null
          harvest_date?: string | null
          id?: string
          name: string
          pincode?: string | null
          profit_share?: number | null
          soil_moisture?: number | null
          soil_nitrogen?: number | null
          soil_organic_carbon?: number | null
          soil_ph?: number | null
          soil_phosphorus?: number | null
          soil_potassium?: number | null
          sowing_date?: string | null
          total_land?: number
          village?: string
        }
        Update: {
          contract_summary?: string | null
          created_at?: string
          created_by?: string | null
          crop?: string | null
          crop_health_score?: number | null
          expected_revenue?: number | null
          growth_stage?: string | null
          harvest_date?: string | null
          id?: string
          name?: string
          pincode?: string | null
          profit_share?: number | null
          soil_moisture?: number | null
          soil_nitrogen?: number | null
          soil_organic_carbon?: number | null
          soil_ph?: number | null
          soil_phosphorus?: number | null
          soil_potassium?: number | null
          sowing_date?: string | null
          total_land?: number
          village?: string
        }
        Relationships: []
      }
      motor_status: {
        Row: {
          farm_id: string
          id: string
          last_toggled: string | null
          motor_on: boolean | null
          pump_type: string | null
          toggled_by: string | null
        }
        Insert: {
          farm_id: string
          id?: string
          last_toggled?: string | null
          motor_on?: boolean | null
          pump_type?: string | null
          toggled_by?: string | null
        }
        Update: {
          farm_id?: string
          id?: string
          last_toggled?: string | null
          motor_on?: boolean | null
          pump_type?: string | null
          toggled_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "motor_status_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string | null
          due_date: string
          farm_id: string
          id: string
          photo_required: boolean | null
          status: string
          title: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          farm_id: string
          id?: string
          photo_required?: boolean | null
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          farm_id?: string
          id?: string
          photo_required?: boolean | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "landowner" | "fieldmanager" | "expert" | "worker"
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
    Enums: {
      app_role: ["admin", "landowner", "fieldmanager", "expert", "worker"],
    },
  },
} as const
