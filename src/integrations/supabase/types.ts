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
      abandoned_contact_requests: {
        Row: {
          business_email: string
          captured_data: Json | null
          created_at: string
          first_name: string
          id: string
          last_active_step: number
          last_name: string
          status: string
          updated_at: string
        }
        Insert: {
          business_email: string
          captured_data?: Json | null
          created_at?: string
          first_name?: string
          id?: string
          last_active_step?: number
          last_name?: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_email?: string
          captured_data?: Json | null
          created_at?: string
          first_name?: string
          id?: string
          last_active_step?: number
          last_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      abandoned_eb_forms: {
        Row: {
          company: string | null
          company_name: string
          completed: boolean
          created_at: string
          email: string
          first_name: string
          form_data: Json | null
          id: string
          last_name: string
          last_page_visited: number
          status: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          company_name: string
          completed?: boolean
          created_at?: string
          email: string
          first_name: string
          form_data?: Json | null
          id?: string
          last_name: string
          last_page_visited?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          company_name?: string
          completed?: boolean
          created_at?: string
          email?: string
          first_name?: string
          form_data?: Json | null
          id?: string
          last_name?: string
          last_page_visited?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      build_requests: {
        Row: {
          account_number: string | null
          additional_info: string | null
          chosen_solutions: string[]
          company_name: string
          contacts: Json
          email: string
          email_sent_at: string | null
          email_status: string
          event_end_date: string | null
          event_end_time: string | null
          event_start_date: string | null
          event_start_time: string | null
          event_timezone: string | null
          event_title: string
          first_name: string
          go_live_date: string | null
          id: string
          kickoff_date_1: string | null
          kickoff_date_2: string | null
          kickoff_time_1: string | null
          kickoff_time_2: string | null
          kickoff_timezone: string | null
          last_name: string
          planner_email: string | null
          planner_first_name: string | null
          planner_last_name: string | null
          primary_poc_phone: string | null
          submitted_at: string
        }
        Insert: {
          account_number?: string | null
          additional_info?: string | null
          chosen_solutions?: string[]
          company_name: string
          contacts?: Json
          email: string
          email_sent_at?: string | null
          email_status?: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_start_date?: string | null
          event_start_time?: string | null
          event_timezone?: string | null
          event_title: string
          first_name: string
          go_live_date?: string | null
          id?: string
          kickoff_date_1?: string | null
          kickoff_date_2?: string | null
          kickoff_time_1?: string | null
          kickoff_time_2?: string | null
          kickoff_timezone?: string | null
          last_name: string
          planner_email?: string | null
          planner_first_name?: string | null
          planner_last_name?: string | null
          primary_poc_phone?: string | null
          submitted_at?: string
        }
        Update: {
          account_number?: string | null
          additional_info?: string | null
          chosen_solutions?: string[]
          company_name?: string
          contacts?: Json
          email?: string
          email_sent_at?: string | null
          email_status?: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_start_date?: string | null
          event_start_time?: string | null
          event_timezone?: string | null
          event_title?: string
          first_name?: string
          go_live_date?: string | null
          id?: string
          kickoff_date_1?: string | null
          kickoff_date_2?: string | null
          kickoff_time_1?: string | null
          kickoff_time_2?: string | null
          kickoff_timezone?: string | null
          last_name?: string
          planner_email?: string | null
          planner_first_name?: string | null
          planner_last_name?: string | null
          primary_poc_phone?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          additional_attendees: string[] | null
          business_email: string
          created_at: string
          first_name: string
          google_event_id: string | null
          google_event_link: string | null
          google_meet_link: string | null
          id: string
          last_name: string
          scheduled_date: string
          scheduled_time: string
          selected_products: string[]
          status: string
        }
        Insert: {
          additional_attendees?: string[] | null
          business_email: string
          created_at?: string
          first_name: string
          google_event_id?: string | null
          google_event_link?: string | null
          google_meet_link?: string | null
          id?: string
          last_name: string
          scheduled_date: string
          scheduled_time: string
          selected_products?: string[]
          status?: string
        }
        Update: {
          additional_attendees?: string[] | null
          business_email?: string
          created_at?: string
          first_name?: string
          google_event_id?: string | null
          google_event_link?: string | null
          google_meet_link?: string | null
          id?: string
          last_name?: string
          scheduled_date?: string
          scheduled_time?: string
          selected_products?: string[]
          status?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          cvent_technologies: string[]
          cvent_technologies_other: string | null
          email: string
          email_sent_at: string | null
          email_status: string
          event_launch_date: string | null
          event_type: string | null
          event_type_new_or_clone: string | null
          full_name: string
          id: string
          quote_number: number
          registration_options: string[]
          registration_types_count: string | null
          sessions_count: string | null
          submitted_at: string
        }
        Insert: {
          cvent_technologies?: string[]
          cvent_technologies_other?: string | null
          email: string
          email_sent_at?: string | null
          email_status?: string
          event_launch_date?: string | null
          event_type?: string | null
          event_type_new_or_clone?: string | null
          full_name: string
          id?: string
          quote_number?: number
          registration_options?: string[]
          registration_types_count?: string | null
          sessions_count?: string | null
          submitted_at?: string
        }
        Update: {
          cvent_technologies?: string[]
          cvent_technologies_other?: string | null
          email?: string
          email_sent_at?: string | null
          email_status?: string
          event_launch_date?: string | null
          event_type?: string | null
          event_type_new_or_clone?: string | null
          full_name?: string
          id?: string
          quote_number?: number
          registration_options?: string[]
          registration_types_count?: string | null
          sessions_count?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
