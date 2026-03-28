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
      calendly_connections: {
        Row: {
          access_token: string
          calendly_user_uri: string | null
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          scheduling_url: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendly_user_uri?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scheduling_url?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendly_user_uri?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scheduling_url?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_ai_response: boolean
          metadata: Json | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_ai_response?: boolean
          metadata?: Json | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_ai_response?: boolean
          metadata?: Json | null
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
      contacts: {
        Row: {
          channel: string | null
          conversation_id: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          language: string | null
          name: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          conversation_id?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          language?: string | null
          name?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          conversation_id?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          language?: string | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          browser: string | null
          city: string | null
          cleared_at: string | null
          cleared_by_visitor: boolean
          country: string | null
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          region: string | null
          system: string | null
          topic: string | null
          unread_count: number | null
          updated_at: string | null
          visitor_id: string
          visitor_name: string | null
          visitor_token: string
          widget_owner_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          cleared_at?: string | null
          cleared_by_visitor?: boolean
          country?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          region?: string | null
          system?: string | null
          topic?: string | null
          unread_count?: number | null
          updated_at?: string | null
          visitor_id: string
          visitor_name?: string | null
          visitor_token?: string
          widget_owner_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          cleared_at?: string | null
          cleared_by_visitor?: boolean
          country?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          region?: string | null
          system?: string | null
          topic?: string | null
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
      inspire_video_products: {
        Row: {
          created_at: string
          id: string
          product_card_id: string
          sort_order: number
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_card_id: string
          sort_order?: number
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_card_id?: string
          sort_order?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspire_video_products_product_card_id_fkey"
            columns: ["product_card_id"]
            isOneToOne: false
            referencedRelation: "product_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspire_video_products_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inspire_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      inspire_videos: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          source: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          source?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          source?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      instagram_connections: {
        Row: {
          connected_at: string
          id: string
          instagram_user_id: string
          instagram_username: string | null
          page_access_token: string
          page_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          id?: string
          instagram_user_id: string
          instagram_username?: string | null
          page_access_token: string
          page_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          id?: string
          instagram_user_id?: string
          instagram_username?: string | null
          page_access_token?: string
          page_id?: string
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
          shopify_product_id: string | null
          shopify_variant_id: string | null
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
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
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
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
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
          g2_review_approved: boolean
          id: string
          last_name: string | null
          lovable_promo_claimed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          g2_review_approved?: boolean
          id?: string
          last_name?: string | null
          lovable_promo_claimed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          g2_review_approved?: boolean
          id?: string
          last_name?: string | null
          lovable_promo_claimed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopify_connections: {
        Row: {
          admin_access_token: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          product_count: number | null
          store_domain: string
          storefront_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_access_token?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          product_count?: number | null
          store_domain: string
          storefront_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_access_token?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          product_count?: number | null
          store_domain?: string
          storefront_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          embedding: string | null
          id: string
          source_id: string
          user_id: string
        }
        Insert: {
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source_id: string
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          source_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "training_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sources: {
        Row: {
          content: string
          created_at: string
          id: string
          source_type: string
          status: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
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
          ai_temperature: number
          ai_tone: string
          background_image: string | null
          background_type: string
          button_logo: string | null
          calendly_enabled: boolean
          calendly_event_url: string | null
          chatbot_enabled: boolean
          chatbot_instructions: string | null
          contact_name: string
          created_at: string
          cta_text: string | null
          custom_css: string | null
          custom_js: string | null
          faq_enabled: boolean
          forward_email: string | null
          google_business_name: string | null
          google_business_place_id: string | null
          google_business_rating: number | null
          google_business_ratings_total: number | null
          google_business_url: string | null
          google_reviews_enabled: boolean
          home_section_order: string[] | null
          id: string
          inspire_enabled: boolean
          instagram_dm_enabled: boolean
          instagram_enabled: boolean
          language: string
          logo: string | null
          offer_help: string
          product_carousel_enabled: boolean
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
          widget_position: string
          widget_theme: string
          widget_type: string
        }
        Insert: {
          ai_api_key?: string | null
          ai_provider?: string
          ai_temperature?: number
          ai_tone?: string
          background_image?: string | null
          background_type?: string
          button_logo?: string | null
          calendly_enabled?: boolean
          calendly_event_url?: string | null
          chatbot_enabled?: boolean
          chatbot_instructions?: string | null
          contact_name?: string
          created_at?: string
          cta_text?: string | null
          custom_css?: string | null
          custom_js?: string | null
          faq_enabled?: boolean
          forward_email?: string | null
          google_business_name?: string | null
          google_business_place_id?: string | null
          google_business_rating?: number | null
          google_business_ratings_total?: number | null
          google_business_url?: string | null
          google_reviews_enabled?: boolean
          home_section_order?: string[] | null
          id?: string
          inspire_enabled?: boolean
          instagram_dm_enabled?: boolean
          instagram_enabled?: boolean
          language?: string
          logo?: string | null
          offer_help?: string
          product_carousel_enabled?: boolean
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
          widget_position?: string
          widget_theme?: string
          widget_type?: string
        }
        Update: {
          ai_api_key?: string | null
          ai_provider?: string
          ai_temperature?: number
          ai_tone?: string
          background_image?: string | null
          background_type?: string
          button_logo?: string | null
          calendly_enabled?: boolean
          calendly_event_url?: string | null
          chatbot_enabled?: boolean
          chatbot_instructions?: string | null
          contact_name?: string
          created_at?: string
          cta_text?: string | null
          custom_css?: string | null
          custom_js?: string | null
          faq_enabled?: boolean
          forward_email?: string | null
          google_business_name?: string | null
          google_business_place_id?: string | null
          google_business_rating?: number | null
          google_business_ratings_total?: number | null
          google_business_url?: string | null
          google_reviews_enabled?: boolean
          home_section_order?: string[] | null
          id?: string
          inspire_enabled?: boolean
          instagram_dm_enabled?: boolean
          instagram_enabled?: boolean
          language?: string
          logo?: string | null
          offer_help?: string
          product_carousel_enabled?: boolean
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
          widget_position?: string
          widget_theme?: string
          widget_type?: string
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
      match_training_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          id: string
          similarity: number
          source_id: string
        }[]
      }
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
