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
    PostgrestVersion: "14.5"
  }
  company_os: {
    Tables: {
      audit_log: {
        Row: {
          actor_label: string | null
          actor_person_id: string | null
          changed_at: string
          context: Json
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          actor_label?: string | null
          actor_person_id?: string | null
          changed_at?: string
          context?: Json
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          actor_label?: string | null
          actor_person_id?: string | null
          changed_at?: string
          context?: Json
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          primary_domain: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          primary_domain?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          primary_domain?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          billing_address: string | null
          client_end_date: string | null
          client_start_date: string | null
          client_types: string[]
          country: string | null
          created_at: string
          id: string
          industry: string | null
          industry_normalized: string | null
          is_ai_program: boolean
          lifecycle_stage: string
          metadata: Json
          name: string
          notes: string | null
          owner_id: string | null
          priority: string | null
          size_band: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          billing_address?: string | null
          client_end_date?: string | null
          client_start_date?: string | null
          client_types?: string[]
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          industry_normalized?: string | null
          is_ai_program?: boolean
          lifecycle_stage?: string
          metadata?: Json
          name: string
          notes?: string | null
          owner_id?: string | null
          priority?: string | null
          size_band?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          billing_address?: string | null
          client_end_date?: string | null
          client_start_date?: string | null
          client_types?: string[]
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          industry_normalized?: string | null
          is_ai_program?: boolean
          lifecycle_stage?: string
          metadata?: Json
          name?: string
          notes?: string | null
          owner_id?: string | null
          priority?: string | null
          size_band?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          body: string | null
          company_id: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json
          occurred_at: string
          owner_id: string | null
          person_id: string | null
          subject: string | null
          subject_id: string | null
          subject_type: string | null
        }
        Insert: {
          body?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          occurred_at?: string
          owner_id?: string | null
          person_id?: string | null
          subject?: string | null
          subject_id?: string | null
          subject_type?: string | null
        }
        Update: {
          body?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          occurred_at?: string
          owner_id?: string | null
          person_id?: string | null
          subject?: string | null
          subject_id?: string | null
          subject_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_runs: {
        Row: {
          ai_cache_read_tokens: number
          ai_cache_write_tokens: number
          ai_calls: number
          ai_input_tokens: number
          ai_output_tokens: number
          created_at: string
          duration_ms: number | null
          error: string | null
          finished_at: string | null
          host: string
          id: string
          log: string | null
          result: Json | null
          routine_id: string
          started_at: string
          status: string
          summary: string | null
        }
        Insert: {
          ai_cache_read_tokens?: number
          ai_cache_write_tokens?: number
          ai_calls?: number
          ai_input_tokens?: number
          ai_output_tokens?: number
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          host: string
          id?: string
          log?: string | null
          result?: Json | null
          routine_id: string
          started_at?: string
          status?: string
          summary?: string | null
        }
        Update: {
          ai_cache_read_tokens?: number
          ai_cache_write_tokens?: number
          ai_calls?: number
          ai_input_tokens?: number
          ai_output_tokens?: number
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          host?: string
          id?: string
          log?: string | null
          result?: Json | null
          routine_id?: string
          started_at?: string
          status?: string
          summary?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      people: {
        Row: {
          archived_at: string | null
          birthday: string | null
          chinese_sign: string | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          do_not_contact: boolean | null
          email: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          is_team_member: boolean | null
          last_name: string | null
          lifecycle_stage: string | null
          marketing_consent: string | null
          marketing_consent_at: string | null
          marketing_consent_source: string | null
          metadata: Json | null
          persona: string | null
          phone: string | null
          preferred_name: string | null
          source: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          birthday?: string | null
          chinese_sign?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          first_name?: never
          full_name?: string | null
          gender?: string | null
          id?: string | null
          is_team_member?: boolean | null
          last_name?: never
          lifecycle_stage?: string | null
          marketing_consent?: string | null
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          metadata?: Json | null
          persona?: string | null
          phone?: string | null
          preferred_name?: never
          source?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          birthday?: string | null
          chinese_sign?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          first_name?: never
          full_name?: string | null
          gender?: string | null
          id?: string | null
          is_team_member?: boolean | null
          last_name?: never
          lifecycle_stage?: string | null
          marketing_consent?: string | null
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          metadata?: Json | null
          persona?: string | null
          phone?: string | null
          preferred_name?: never
          source?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          inquiry_id: string | null
          person_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          inquiry_id?: string | null
          person_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          inquiry_id?: string | null
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people_admin_list"
            referencedColumns: ["id"]
          },
        ]
      }
      almanac_days: {
        Row: {
          activities: Json
          auspicious_hours: Json
          created_at: string
          date: string
          holiday: string | null
          is_leap_month: boolean
          lunar_day: number
          lunar_month: number
          match_day: Json | null
          officer: Json
          pillars: Json
          score: number
          tone: string
          updated_at: string
          weekday: string
          western_moment: string | null
          year_conflict: string
        }
        Insert: {
          activities: Json
          auspicious_hours: Json
          created_at?: string
          date: string
          holiday?: string | null
          is_leap_month?: boolean
          lunar_day: number
          lunar_month: number
          match_day?: Json | null
          officer: Json
          pillars: Json
          score: number
          tone: string
          updated_at?: string
          weekday: string
          western_moment?: string | null
          year_conflict: string
        }
        Update: {
          activities?: Json
          auspicious_hours?: Json
          created_at?: string
          date?: string
          holiday?: string | null
          is_leap_month?: boolean
          lunar_day?: number
          lunar_month?: number
          match_day?: Json | null
          officer?: Json
          pillars?: Json
          score?: number
          tone?: string
          updated_at?: string
          weekday?: string
          western_moment?: string | null
          year_conflict?: string
        }
        Relationships: []
      }
      book_orders: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string
          email: string
          full_name: string | null
          id: string
          notes: string | null
          phone: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_line1: string | null
          shipping_line2: string | null
          shipping_name: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          sku: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          email: string
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_line1?: string | null
          shipping_line2?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          sku: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string
          email?: string
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_line1?: string | null
          shipping_line2?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          sku?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_cents: number | null
          astrologer_id: string | null
          birth_time: string | null
          birthday: string | null
          created_at: string
          currency: string | null
          duration_minutes: number
          email: string
          final_reading_html: string | null
          final_reading_sent_at: string | null
          full_name: string
          id: string
          is_relationship: boolean
          meeting_external_id: string | null
          meeting_source: string | null
          partner_birth_time: string | null
          partner_birthday: string | null
          partner_gender: string | null
          partner_name: string | null
          phone: string | null
          post_call_notes: string | null
          prep_notes: string | null
          public_token: string | null
          question: string | null
          scheduled_at: string | null
          slot_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          summary_text: string | null
          transcript_text: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          astrologer_id?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes: number
          email: string
          final_reading_html?: string | null
          final_reading_sent_at?: string | null
          full_name: string
          id?: string
          is_relationship?: boolean
          meeting_external_id?: string | null
          meeting_source?: string | null
          partner_birth_time?: string | null
          partner_birthday?: string | null
          partner_gender?: string | null
          partner_name?: string | null
          phone?: string | null
          post_call_notes?: string | null
          prep_notes?: string | null
          public_token?: string | null
          question?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          summary_text?: string | null
          transcript_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          astrologer_id?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          email?: string
          final_reading_html?: string | null
          final_reading_sent_at?: string | null
          full_name?: string
          id?: string
          is_relationship?: boolean
          meeting_external_id?: string | null
          meeting_source?: string | null
          partner_birth_time?: string | null
          partner_birthday?: string | null
          partner_gender?: string | null
          partner_name?: string | null
          phone?: string | null
          post_call_notes?: string | null
          prep_notes?: string | null
          public_token?: string | null
          question?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          summary_text?: string | null
          transcript_text?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "reading_availability"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount_cents: number
          booking_id: string | null
          close_date: string | null
          created_at: string
          currency: string
          id: string
          inquiry_id: string | null
          lost_at: string | null
          member_subscription_id: string | null
          notes: string | null
          owner_id: string | null
          person_id: string | null
          source: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          won_at: string | null
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          close_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          inquiry_id?: string | null
          lost_at?: string | null
          member_subscription_id?: string | null
          notes?: string | null
          owner_id?: string | null
          person_id?: string | null
          source: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          won_at?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          close_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          inquiry_id?: string | null
          lost_at?: string | null
          member_subscription_id?: string | null
          notes?: string | null
          owner_id?: string | null
          person_id?: string | null
          source?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people_admin_list"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          campaign_id: number | null
          campaign_name: string | null
          created_at: string
          email: string
          event_type: string
          id: string
          list_ids: number[] | null
          occurred_at: string
          payload: Json
          provider: string
          url: string | null
        }
        Insert: {
          campaign_id?: number | null
          campaign_name?: string | null
          created_at?: string
          email: string
          event_type: string
          id?: string
          list_ids?: number[] | null
          occurred_at: string
          payload?: Json
          provider?: string
          url?: string | null
        }
        Update: {
          campaign_id?: number | null
          campaign_name?: string | null
          created_at?: string
          email?: string
          event_type?: string
          id?: string
          list_ids?: number[] | null
          occurred_at?: string
          payload?: Json
          provider?: string
          url?: string | null
        }
        Relationships: []
      }
      email_replies: {
        Row: {
          created_at: string
          forwarded_at: string | null
          from_email: string
          from_name: string | null
          harvest_basis: string | null
          harvested_sign: string | null
          id: string
          message_id: string | null
          payload: Json
          person_id: string | null
          sent_at: string | null
          subject: string | null
          text_body: string | null
          to_email: string | null
        }
        Insert: {
          created_at?: string
          forwarded_at?: string | null
          from_email: string
          from_name?: string | null
          harvest_basis?: string | null
          harvested_sign?: string | null
          id?: string
          message_id?: string | null
          payload?: Json
          person_id?: string | null
          sent_at?: string | null
          subject?: string | null
          text_body?: string | null
          to_email?: string | null
        }
        Update: {
          created_at?: string
          forwarded_at?: string | null
          from_email?: string
          from_name?: string | null
          harvest_basis?: string | null
          harvested_sign?: string | null
          id?: string
          message_id?: string | null
          payload?: Json
          person_id?: string | null
          sent_at?: string | null
          subject?: string | null
          text_body?: string | null
          to_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_replies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_replies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people_admin_list"
            referencedColumns: ["id"]
          },
        ]
      }
      horoscope_runs: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          failed: number
          generated: number
          id: string
          run_at: string
          status: string
          target_date: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          failed?: number
          generated?: number
          id?: string
          run_at?: string
          status: string
          target_date: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          failed?: number
          generated?: number
          id?: string
          run_at?: string
          status?: string
          target_date?: string
        }
        Relationships: []
      }
      horoscopes: {
        Row: {
          category: string
          created_at: string
          date: string
          scope: string
          score: number
          signal_payload: Json
          status: string
          text: string
          tone: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          scope: string
          score: number
          signal_payload: Json
          status?: string
          text: string
          tone: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          scope?: string
          score?: number
          signal_payload?: Json
          status?: string
          text?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      inner_circle: {
        Row: {
          birth_place: string | null
          birth_time: string | null
          birthday: string | null
          created_at: string
          gender: string | null
          id: string
          name: string
          pillars: Json | null
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          pillars?: Json | null
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          pillars?: Json | null
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          id: string
          message: string | null
          person_id: string
          reading_type_id: string | null
          source: string | null
          source_site: string
          status: string
          subject: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          person_id: string
          reading_type_id?: string | null
          source?: string | null
          source_site?: string
          status?: string
          subject?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          person_id?: string
          reading_type_id?: string | null
          source?: string | null
          source_site?: string
          status?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people_admin_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_reading_type_id_fkey"
            columns: ["reading_type_id"]
            isOneToOne: false
            referencedRelation: "reading_types"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_source_connections: {
        Row: {
          access_token: string
          account_label: string | null
          account_metadata: Json | null
          created_at: string
          refresh_token: string | null
          source: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_label?: string | null
          account_metadata?: Json | null
          created_at?: string
          refresh_token?: string | null
          source: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_label?: string | null
          account_metadata?: Json | null
          created_at?: string
          refresh_token?: string | null
          source?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          plan: string
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          address: string | null
          archived_at: string | null
          birth_place: string | null
          birth_time: string | null
          birthday: string | null
          chinese_sign: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          do_not_contact: boolean
          email: string
          gender: string | null
          id: string
          is_team_member: boolean
          last_emailed_at: string | null
          lifecycle_stage: string
          marketing_consent: string
          marketing_consent_at: string | null
          marketing_consent_source: string | null
          membership_status: string | null
          metadata: Json
          name: string | null
          next_send_at: string | null
          nurture_stage: number
          nurture_status: string | null
          ok_to_contact: boolean
          persona: string | null
          phone: string | null
          role: string | null
          source: string | null
          source_site: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          chinese_sign?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          do_not_contact?: boolean
          email: string
          gender?: string | null
          id?: string
          is_team_member?: boolean
          last_emailed_at?: string | null
          lifecycle_stage?: string
          marketing_consent?: string
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          membership_status?: string | null
          metadata?: Json
          name?: string | null
          next_send_at?: string | null
          nurture_stage?: number
          nurture_status?: string | null
          ok_to_contact?: boolean
          persona?: string | null
          phone?: string | null
          role?: string | null
          source?: string | null
          source_site?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          chinese_sign?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          do_not_contact?: boolean
          email?: string
          gender?: string | null
          id?: string
          is_team_member?: boolean
          last_emailed_at?: string | null
          lifecycle_stage?: string
          marketing_consent?: string
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          membership_status?: string | null
          metadata?: Json
          name?: string | null
          next_send_at?: string | null
          nurture_stage?: number
          nurture_status?: string | null
          ok_to_contact?: boolean
          persona?: string | null
          phone?: string | null
          role?: string | null
          source?: string | null
          source_site?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_place: string | null
          birth_time: string | null
          birthday: string | null
          created_at: string
          gender: string | null
          is_premium: boolean
          membership_type: string | null
          name: string | null
          person_id: string | null
          pillars: Json | null
          premium_expires_at: string | null
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          gender?: string | null
          is_premium?: boolean
          membership_type?: string | null
          name?: string | null
          person_id?: string | null
          pillars?: Json | null
          premium_expires_at?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_place?: string | null
          birth_time?: string | null
          birthday?: string | null
          created_at?: string
          gender?: string | null
          is_premium?: boolean
          membership_type?: string | null
          name?: string | null
          person_id?: string | null
          pillars?: Json | null
          premium_expires_at?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people_admin_list"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_availability: {
        Row: {
          astrologer_id: string
          booking_id: string | null
          created_at: string
          duration_minutes: number
          held_for_session: string | null
          held_until: string | null
          id: string
          slot_start: string
          status: string
          updated_at: string
        }
        Insert: {
          astrologer_id: string
          booking_id?: string | null
          created_at?: string
          duration_minutes?: number
          held_for_session?: string | null
          held_until?: string | null
          id?: string
          slot_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          astrologer_id?: string
          booking_id?: string | null
          created_at?: string
          duration_minutes?: number
          held_for_session?: string | null
          held_until?: string | null
          id?: string
          slot_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_types: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          in_person: boolean
          is_active: boolean
          name: string
          online: boolean
          slug: string
          sort_order: number
          via_ai: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          in_person?: boolean
          is_active?: boolean
          name: string
          online?: boolean
          slug: string
          sort_order?: number
          via_ai?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          in_person?: boolean
          is_active?: boolean
          name?: string
          online?: boolean
          slug?: string
          sort_order?: number
          via_ai?: boolean
        }
        Relationships: []
      }
      readings: {
        Row: {
          created_at: string
          html: string | null
          id: string
          person1_birth_time: string | null
          person1_birthday: string | null
          person1_gender: string | null
          person1_name: string | null
          person2_birth_time: string | null
          person2_birthday: string | null
          person2_gender: string | null
          person2_name: string | null
          public_token: string | null
          rating: number | null
          report: Json | null
          sent_to: string | null
          slug: string | null
          type: string
          types: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          html?: string | null
          id?: string
          person1_birth_time?: string | null
          person1_birthday?: string | null
          person1_gender?: string | null
          person1_name?: string | null
          person2_birth_time?: string | null
          person2_birthday?: string | null
          person2_gender?: string | null
          person2_name?: string | null
          public_token?: string | null
          rating?: number | null
          report?: Json | null
          sent_to?: string | null
          slug?: string | null
          type?: string
          types?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          html?: string | null
          id?: string
          person1_birth_time?: string | null
          person1_birthday?: string | null
          person1_gender?: string | null
          person1_name?: string | null
          person2_birth_time?: string | null
          person2_birthday?: string | null
          person2_gender?: string | null
          person2_name?: string | null
          public_token?: string | null
          rating?: number | null
          report?: Json | null
          sent_to?: string | null
          slug?: string | null
          type?: string
          types?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          astrologer_id: string | null
          body_markdown: string | null
          client_id: string
          created_at: string
          email_message_id: string | null
          generated_by: string | null
          generation_error: string | null
          id: string
          meeting_external_id: string | null
          meeting_source: string | null
          sent_at: string | null
          sent_to_email: string | null
          session_id: string | null
          source_summary: string | null
          source_transcript: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          astrologer_id?: string | null
          body_markdown?: string | null
          client_id: string
          created_at?: string
          email_message_id?: string | null
          generated_by?: string | null
          generation_error?: string | null
          id?: string
          meeting_external_id?: string | null
          meeting_source?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          session_id?: string | null
          source_summary?: string | null
          source_transcript?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          astrologer_id?: string | null
          body_markdown?: string | null
          client_id?: string
          created_at?: string
          email_message_id?: string | null
          generated_by?: string | null
          generation_error?: string | null
          id?: string
          meeting_external_id?: string | null
          meeting_source?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          session_id?: string | null
          source_summary?: string | null
          source_transcript?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_email_campaign_stats: {
        Row: {
          campaign_id: number | null
          campaign_name: string | null
          delivered: number | null
          first_event_at: string | null
          hard_bounces: number | null
          last_event_at: string | null
          soft_bounces: number | null
          spam_complaints: number | null
          total_clicks: number | null
          total_opens: number | null
          unique_clicks: number | null
          unique_opens: number | null
          unsubscribes: number | null
        }
        Relationships: []
      }
      admin_email_domain_stats: {
        Row: {
          bounces: number | null
          campaign_id: number | null
          complaints: number | null
          delivered: number | null
          domain: string | null
          opens: number | null
        }
        Relationships: []
      }
      admin_email_event_timeline: {
        Row: {
          bucket: string | null
          campaign_id: number | null
          event_type: string | null
          events: number | null
        }
        Relationships: []
      }
      admin_email_suppressed: {
        Row: {
          campaign_name: string | null
          email: string | null
          event_type: string | null
          suppressed_at: string | null
        }
        Relationships: []
      }
      admin_email_top_links: {
        Row: {
          campaign_id: number | null
          clicks: number | null
          unique_clicks: number | null
          url: string | null
        }
        Relationships: []
      }
      almanac_day_summary: {
        Row: {
          date: string | null
          holiday: string | null
          lunar_day: number | null
          lunar_month: number | null
          match_day: Json | null
          officer_chinese: string | null
          officer_english: string | null
          pillars: Json | null
          score: number | null
          tone: string | null
          weekday: string | null
          western_moment: string | null
          year_conflict: string | null
        }
        Insert: {
          date?: string | null
          holiday?: string | null
          lunar_day?: number | null
          lunar_month?: number | null
          match_day?: Json | null
          officer_chinese?: never
          officer_english?: never
          pillars?: Json | null
          score?: number | null
          tone?: string | null
          weekday?: string | null
          western_moment?: string | null
          year_conflict?: string | null
        }
        Update: {
          date?: string | null
          holiday?: string | null
          lunar_day?: number | null
          lunar_month?: number | null
          match_day?: Json | null
          officer_chinese?: never
          officer_english?: never
          pillars?: Json | null
          score?: number | null
          tone?: string | null
          weekday?: string | null
          western_moment?: string | null
          year_conflict?: string | null
        }
        Relationships: []
      }
      almanac_today: {
        Row: {
          activities: Json | null
          auspicious_hours: Json | null
          created_at: string | null
          date: string | null
          holiday: string | null
          is_leap_month: boolean | null
          lunar_day: number | null
          lunar_month: number | null
          match_day: Json | null
          officer: Json | null
          pillars: Json | null
          score: number | null
          tone: string | null
          updated_at: string | null
          weekday: string | null
          western_moment: string | null
          year_conflict: string | null
        }
        Insert: {
          activities?: Json | null
          auspicious_hours?: Json | null
          created_at?: string | null
          date?: string | null
          holiday?: string | null
          is_leap_month?: boolean | null
          lunar_day?: number | null
          lunar_month?: number | null
          match_day?: Json | null
          officer?: Json | null
          pillars?: Json | null
          score?: number | null
          tone?: string | null
          updated_at?: string | null
          weekday?: string | null
          western_moment?: string | null
          year_conflict?: string | null
        }
        Update: {
          activities?: Json | null
          auspicious_hours?: Json | null
          created_at?: string | null
          date?: string | null
          holiday?: string | null
          is_leap_month?: boolean | null
          lunar_day?: number | null
          lunar_month?: number | null
          match_day?: Json | null
          officer?: Json | null
          pillars?: Json | null
          score?: number | null
          tone?: string | null
          updated_at?: string | null
          weekday?: string | null
          western_moment?: string | null
          year_conflict?: string | null
        }
        Relationships: []
      }
      horoscope_day_summary: {
        Row: {
          date: string | null
          general_score: number | null
          general_tone: string | null
          match_day: Json | null
          pillars: Json | null
          western_moment: string | null
        }
        Insert: {
          date?: string | null
          general_score?: number | null
          general_tone?: string | null
          match_day?: never
          pillars?: never
          western_moment?: never
        }
        Update: {
          date?: string | null
          general_score?: number | null
          general_tone?: string | null
          match_day?: never
          pillars?: never
          western_moment?: never
        }
        Relationships: []
      }
      horoscope_today: {
        Row: {
          category: string | null
          created_at: string | null
          date: string | null
          scope: string | null
          score: number | null
          signal_payload: Json | null
          status: string | null
          text: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          scope?: string | null
          score?: number | null
          signal_payload?: Json | null
          status?: string | null
          text?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          scope?: string | null
          score?: number | null
          signal_payload?: Json | null
          status?: string | null
          text?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      people_admin_list: {
        Row: {
          address: string | null
          birth_place: string | null
          birth_time: string | null
          birthday: string | null
          chinese_sign: string | null
          company: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string | null
          inquiry_count: number | null
          is_legacy_customer: boolean | null
          is_member: boolean | null
          is_premium_member: boolean | null
          is_recent_customer: boolean | null
          last_activity: string | null
          last_inquiry_at: string | null
          latest_deal_at: string | null
          lifecycle_stage: string | null
          membership_status: string | null
          name: string | null
          nurture_stage: number | null
          nurture_status: string | null
          ok_to_contact: boolean | null
          order_count: number | null
          phone: string | null
          role: string | null
          source: string | null
          source_site: string | null
          types: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_brevo_vault_key: { Args: { p_key: string }; Returns: undefined }
      get_inquiries: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_source_site?: string
          p_status?: string
          p_type?: string
        }
        Returns: {
          created_at: string
          id: string
          message: string
          person_company: string
          person_email: string
          person_id: string
          person_name: string
          person_phone: string
          person_role: string
          source: string
          source_site: string
          status: string
          subject: string
          type: string
        }[]
      }
      get_inquiry_counts: {
        Args: never
        Returns: {
          count: number
          status: string
          type: string
        }[]
      }
      get_inquiry_detail: {
        Args: { p_inquiry_id: string }
        Returns: {
          created_at: string
          id: string
          message: string
          person_company: string
          person_email: string
          person_id: string
          person_name: string
          person_ok_to_contact: boolean
          person_phone: string
          person_role: string
          person_source_site: string
          source: string
          source_site: string
          status: string
          subject: string
          type: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_portal_user: { Args: never; Returns: boolean }
      log_session_payment: {
        Args: {
          p_amount?: number
          p_notes?: string
          p_paid_at?: string
          p_payment_method?: string
          p_session_id: string
        }
        Returns: string
      }
      release_expired_holds: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_booking: {
        Args: {
          p_birthday?: string
          p_chinese_sign?: string
          p_email: string
          p_message?: string
          p_name: string
          p_phone?: string
          p_reading_type_slug: string
        }
        Returns: string
      }
      submit_contact: {
        Args: {
          p_email: string
          p_message?: string
          p_name: string
          p_phone?: string
          p_subject?: string
        }
        Returns: string
      }
      submit_inquiry: {
        Args: {
          p_company?: string
          p_email: string
          p_message?: string
          p_name: string
          p_phone?: string
          p_role?: string
          p_source?: string
          p_source_site?: string
          p_subject?: string
          p_type?: string
        }
        Returns: string
      }
      submit_newsletter:
        | {
            Args: {
              p_chinese_sign?: string
              p_email: string
              p_source?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_email: string
              p_name?: string
              p_source?: string
              p_source_site?: string
            }
            Returns: string
          }
      update_inquiry_status: {
        Args: { p_inquiry_id: string; p_status: string }
        Returns: string
      }
      update_person:
        | {
            Args: {
              p_address?: string
              p_birthday?: string
              p_chinese_sign?: string
              p_email?: string
              p_name?: string
              p_person_id: string
              p_phone?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_company?: string
              p_email?: string
              p_name?: string
              p_person_id: string
              p_phone?: string
              p_role?: string
            }
            Returns: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  company_os: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
