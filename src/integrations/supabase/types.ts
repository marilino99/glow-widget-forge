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
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          unread_count: number | null
          updated_at: string | null
          visitor_id: string
          visitor_name: string | null
          visitor_token: string
          widget_owner_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
          visitor_id: string
          visitor_name?: string | null
          visitor_token?: string
          widget_owner_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
          visitor_id?: string
          visitor_name?: string | null
          visitor_token?: string
          widget_owner_id?: string
        }
        Relationships: []
      }
      custom_links: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          author_name: string | null
          caption: string | null
          created_at: string
          id: string
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      product_cards: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          old_price: string | null
          price: string | null
          product_url: string | null
          promo_badge: string | null
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          old_price?: string | null
          price?: string | null
          product_url?: string | null
          promo_badge?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          old_price?: string | null
          price?: string | null
          product_url?: string | null
          promo_badge?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      widget_configurations: {
        Row: {
          ai_api_key: string | null
          ai_provider: string
          background_image: string | null
          background_type: string
          button_logo: string | null
          chatbot_enabled: boolean
          chatbot_instructions: string | null
          contact_name: string
          created_at: string
          custom_css: string | null
          custom_js: string | null
          faq_enabled: boolean
          forward_email: string | null
          id: string
          instagram_enabled: boolean
          language: string
          logo: string | null
          offer_help: string
          say_hello: string
          selected_avatar: string | null
          show_branding: boolean
          updated_at: string
          user_id: string
          website_url: string | null
          whatsapp_country_code: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
          widget_color: string
          widget_theme: string
        }
        Insert: {
          ai_api_key?: string | null
          ai_provider?: string
          background_image?: string | null
          background_type?: string
          button_logo?: string | null
          chatbot_enabled?: boolean
          chatbot_instructions?: string | null
          contact_name?: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          faq_enabled?: boolean
          forward_email?: string | null
          id?: string
          instagram_enabled?: boolean
          language?: string
          logo?: string | null
          offer_help?: string
          say_hello?: string
          selected_avatar?: string | null
          show_branding?: boolean
          updated_at?: string
          user_id: string
          website_url?: string | null
          whatsapp_country_code?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          widget_color?: string
          widget_theme?: string
        }
        Update: {
          ai_api_key?: string | null
          ai_provider?: string
          background_image?: string | null
          background_type?: string
          button_logo?: string | null
          chatbot_enabled?: boolean
          chatbot_instructions?: string | null
          contact_name?: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          faq_enabled?: boolean
          forward_email?: string | null
          id?: string
          instagram_enabled?: boolean
          language?: string
          logo?: string | null
          offer_help?: string
          say_hello?: string
          selected_avatar?: string | null
          show_branding?: boolean
          updated_at?: string
          user_id?: string
          website_url?: string | null
          whatsapp_country_code?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          widget_color?: string
          widget_theme?: string
        }
        Relationships: []
      }
      widget_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page_url: string | null
          visitor_id: string | null
          widget_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page_url?: string | null
          visitor_id?: string | null
          widget_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page_url?: string | null
          visitor_id?: string | null
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_events_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widget_configurations"
            referencedColumns: ["id"]
          },
        ]
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
