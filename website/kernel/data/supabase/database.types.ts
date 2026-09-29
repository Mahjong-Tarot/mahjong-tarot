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
      ai_calls: {
        Row: {
          cache_read_tokens: number | null
          cache_write_tokens: number | null
          class: string
          cost_usd: number | null
          created_at: string
          error_kind: string | null
          id: string
          input_hash: string
          input_tokens: number | null
          latency_ms: number
          model: string
          ok: boolean
          output_tokens: number | null
          prompt_version: string
          provider: string
          run_id: string | null
          site: string
        }
        Insert: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          class: string
          cost_usd?: number | null
          created_at?: string
          error_kind?: string | null
          id?: string
          input_hash: string
          input_tokens?: number | null
          latency_ms: number
          model: string
          ok: boolean
          output_tokens?: number | null
          prompt_version: string
          provider: string
          run_id?: string | null
          site: string
        }
        Update: {
          cache_read_tokens?: number | null
          cache_write_tokens?: number | null
          class?: string
          cost_usd?: number | null
          created_at?: string
          error_kind?: string | null
          id?: string
          input_hash?: string
          input_tokens?: number | null
          latency_ms?: number
          model?: string
          ok?: boolean
          output_tokens?: number | null
          prompt_version?: string
          provider?: string
          run_id?: string | null
          site?: string
        }
        Relationships: []
      }
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
      book_chapters: {
        Row: {
          body_md: string
          book_id: string
          created_at: string
          id: string
          part: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body_md: string
          book_id: string
          created_at?: string
          id?: string
          part?: string | null
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          book_id?: string
          created_at?: string
          id?: string
          part?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          audience: string | null
          brand_id: string
          created_at: string
          description: string | null
          format: string
          id: string
          reader_path: string | null
          slug: string
          sort_order: number
          status: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          brand_id: string
          created_at?: string
          description?: string | null
          format?: string
          id?: string
          reader_path?: string | null
          slug: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          brand_id?: string
          created_at?: string
          description?: string | null
          format?: string
          id?: string
          reader_path?: string | null
          slug?: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_contacts: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          person_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          person_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_contacts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_contacts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          audience: string | null
          author_md: string | null
          auto_publish: boolean
          blog_styles_md: string | null
          brand_id: string
          channels_md: string | null
          content_rules_md: string | null
          created_at: string
          editing_lens_md: string | null
          image_style_md: string | null
          offer: string | null
          positioning: string | null
          preferred_blog_types: string[]
          preferred_image_styles: string[]
          preferred_social_styles: string[]
          primary_cta: string | null
          process_md: string | null
          rules_md: string | null
          seo_lens_md: string | null
          updated_at: string
          updated_by: string | null
          voice_md: string | null
        }
        Insert: {
          audience?: string | null
          author_md?: string | null
          auto_publish?: boolean
          blog_styles_md?: string | null
          brand_id: string
          channels_md?: string | null
          content_rules_md?: string | null
          created_at?: string
          editing_lens_md?: string | null
          image_style_md?: string | null
          offer?: string | null
          positioning?: string | null
          preferred_blog_types?: string[]
          preferred_image_styles?: string[]
          preferred_social_styles?: string[]
          primary_cta?: string | null
          process_md?: string | null
          rules_md?: string | null
          seo_lens_md?: string | null
          updated_at?: string
          updated_by?: string | null
          voice_md?: string | null
        }
        Update: {
          audience?: string | null
          author_md?: string | null
          auto_publish?: boolean
          blog_styles_md?: string | null
          brand_id?: string
          channels_md?: string | null
          content_rules_md?: string | null
          created_at?: string
          editing_lens_md?: string | null
          image_style_md?: string | null
          offer?: string | null
          positioning?: string | null
          preferred_blog_types?: string[]
          preferred_image_styles?: string[]
          preferred_social_styles?: string[]
          primary_cta?: string | null
          process_md?: string | null
          rules_md?: string | null
          seo_lens_md?: string | null
          updated_at?: string
          updated_by?: string | null
          voice_md?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
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
      email_agent_skills: {
        Row: {
          agent_id: string
          body_md: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          version: number
        }
        Insert: {
          agent_id: string
          body_md: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          version: number
        }
        Update: {
          agent_id?: string
          body_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_agent_skills_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "email_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      email_agents: {
        Row: {
          active: boolean
          archived_at: string | null
          audience_id: string
          brand_id: string | null
          cadence_days: number
          created_at: string
          created_by: string | null
          from_email: string | null
          id: string
          max_words: number
          name: string
          reply_to: string | null
          review_mode: string
          sample_size: number
          send_hour: number
          sources: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          audience_id: string
          brand_id?: string | null
          cadence_days?: number
          created_at?: string
          created_by?: string | null
          from_email?: string | null
          id?: string
          max_words?: number
          name: string
          reply_to?: string | null
          review_mode?: string
          sample_size?: number
          send_hour?: number
          sources?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          audience_id?: string
          brand_id?: string | null
          cadence_days?: number
          created_at?: string
          created_by?: string | null
          from_email?: string | null
          id?: string
          max_words?: number
          name?: string
          reply_to?: string | null
          review_mode?: string
          sample_size?: number
          send_hour?: number
          sources?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_agents_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "email_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_agents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      email_audiences: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          rules: Json
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          claimed_at: string | null
          created_at: string
          email: string
          error: string | null
          id: string
          person_id: string
          resend_email_id: string | null
          send_after: string | null
          sent_at: string | null
          skip_reason: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          claimed_at?: string | null
          created_at?: string
          email: string
          error?: string | null
          id?: string
          person_id: string
          resend_email_id?: string | null
          send_after?: string | null
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          claimed_at?: string | null
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          person_id?: string
          resend_email_id?: string | null
          send_after?: string | null
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          agent_error: string | null
          agent_notes: Json
          agent_started_at: string | null
          agent_step: string | null
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          archived_by: string | null
          audience_id: string | null
          batch_size: number
          blocks: Json
          body_md: string
          brand_id: string | null
          created_at: string
          created_by: string | null
          from_email: string | null
          id: string
          name: string
          preheader: string | null
          reply_to: string | null
          scheduled_at: string | null
          segment: Json
          sent_at: string | null
          series_id: string | null
          status: string
          subject: string
          summary_posted_at: string | null
          updated_at: string
        }
        Insert: {
          agent_error?: string | null
          agent_notes?: Json
          agent_started_at?: string | null
          agent_step?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_by?: string | null
          audience_id?: string | null
          batch_size?: number
          blocks?: Json
          body_md?: string
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          from_email?: string | null
          id?: string
          name: string
          preheader?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment?: Json
          sent_at?: string | null
          series_id?: string | null
          status?: string
          subject: string
          summary_posted_at?: string | null
          updated_at?: string
        }
        Update: {
          agent_error?: string | null
          agent_notes?: Json
          agent_started_at?: string | null
          agent_step?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_by?: string | null
          audience_id?: string | null
          batch_size?: number
          blocks?: Json
          body_md?: string
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          from_email?: string | null
          id?: string
          name?: string
          preheader?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          segment?: Json
          sent_at?: string | null
          series_id?: string | null
          status?: string
          subject?: string
          summary_posted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "email_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "email_series"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          message_id: string | null
          metadata: Json
          occurred_at: string
          person_id: string | null
          recipient: string
          resend_email_id: string
          subject: string | null
          svix_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          message_id?: string | null
          metadata?: Json
          occurred_at: string
          person_id?: string | null
          recipient: string
          resend_email_id: string
          subject?: string | null
          svix_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          message_id?: string | null
          metadata?: Json
          occurred_at?: string
          person_id?: string | null
          recipient?: string
          resend_email_id?: string
          subject?: string | null
          svix_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_fk"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          agent_id: string
          approved_at: string | null
          approved_by: string | null
          body_md: string
          claimed_at: string | null
          created_at: string
          edited_at: string | null
          error: string | null
          facts: Json
          hold_reason: string | null
          id: string
          interaction_id: string | null
          person_id: string
          resend_email_id: string | null
          routine_run_id: string | null
          send_after: string | null
          sent_at: string | null
          skill_id: string
          skip_reason: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          approved_at?: string | null
          approved_by?: string | null
          body_md?: string
          claimed_at?: string | null
          created_at?: string
          edited_at?: string | null
          error?: string | null
          facts?: Json
          hold_reason?: string | null
          id?: string
          interaction_id?: string | null
          person_id: string
          resend_email_id?: string | null
          routine_run_id?: string | null
          send_after?: string | null
          sent_at?: string | null
          skill_id: string
          skip_reason?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          approved_at?: string | null
          approved_by?: string | null
          body_md?: string
          claimed_at?: string | null
          created_at?: string
          edited_at?: string | null
          error?: string | null
          facts?: Json
          hold_reason?: string | null
          id?: string
          interaction_id?: string | null
          person_id?: string
          resend_email_id?: string | null
          routine_run_id?: string | null
          send_after?: string | null
          sent_at?: string | null
          skill_id?: string
          skip_reason?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "email_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_routine_run_id_fkey"
            columns: ["routine_run_id"]
            isOneToOne: false
            referencedRelation: "routine_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "email_agent_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      email_series: {
        Row: {
          active: boolean
          archived_at: string | null
          audience_id: string
          batch_size: number
          body_template: string
          brand_id: string | null
          created_at: string
          created_by: string | null
          draft_hour: number
          draft_weekday: number
          from_email: string | null
          id: string
          name: string
          reply_to: string | null
          send_hour: number
          send_weekday: number
          subject: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          audience_id: string
          batch_size?: number
          body_template?: string
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          draft_hour?: number
          draft_weekday?: number
          from_email?: string | null
          id?: string
          name: string
          reply_to?: string | null
          send_hour?: number
          send_weekday?: number
          subject?: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          audience_id?: string
          batch_size?: number
          body_template?: string
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          draft_hour?: number
          draft_weekday?: number
          from_email?: string | null
          id?: string
          name?: string
          reply_to?: string | null
          send_hour?: number
          send_weekday?: number
          subject?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_series_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "email_audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_series_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          blurb: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          starts_at: string | null
          title: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          title: string
        }
        Update: {
          blurb?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          title?: string
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
      marketing_asset_images: {
        Row: {
          created_at: string
          created_by: string | null
          entry_id: string
          id: string
          is_selected: boolean
          model: string | null
          prompt_used: string | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entry_id: string
          id?: string
          is_selected?: boolean
          model?: string | null
          prompt_used?: string | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entry_id?: string
          id?: string
          is_selected?: boolean
          model?: string | null
          prompt_used?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_asset_images_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "marketing_content"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          brand_id: string | null
          created_at: string
          created_by: string | null
          ends_on: string | null
          id: string
          idea: string | null
          name: string
          objective: string | null
          pillar_id: string | null
          seo_geo_md: string | null
          starts_on: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          writer_error: string | null
          writer_started_at: string | null
          writer_step: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          idea?: string | null
          name: string
          objective?: string | null
          pillar_id?: string | null
          seo_geo_md?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          writer_error?: string | null
          writer_started_at?: string | null
          writer_step?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          idea?: string | null
          name?: string
          objective?: string | null
          pillar_id?: string | null
          seo_geo_md?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          writer_error?: string | null
          writer_started_at?: string | null
          writer_step?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "marketing_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_content: {
        Row: {
          ai_search_question: string | null
          asset_url: string | null
          attributes_best_guess: boolean
          blog_style: string | null
          body_html: string | null
          brand_id: string | null
          broadcast_id: string | null
          campaign_id: string | null
          category: string | null
          category_slug: string | null
          channel: string
          copy_md: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          image_brief_md: string | null
          image_style: string | null
          image_type: string | null
          image_url: string | null
          language: string
          meta_description: string | null
          notes: string | null
          page_meta: Json
          parent_id: string | null
          pillar: string | null
          pillar_id: string | null
          posted_url: string | null
          primary_keyword: string | null
          publish_date: string | null
          published_at: string | null
          read_time: string | null
          seo_md: string | null
          slug: string | null
          social_style: string | null
          sort_order: number
          status: string
          title: string
          title_tag: string | null
          updated_at: string
        }
        Insert: {
          ai_search_question?: string | null
          asset_url?: string | null
          attributes_best_guess?: boolean
          blog_style?: string | null
          body_html?: string | null
          brand_id?: string | null
          broadcast_id?: string | null
          campaign_id?: string | null
          category?: string | null
          category_slug?: string | null
          channel: string
          copy_md?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_brief_md?: string | null
          image_style?: string | null
          image_type?: string | null
          image_url?: string | null
          language?: string
          meta_description?: string | null
          notes?: string | null
          page_meta?: Json
          parent_id?: string | null
          pillar?: string | null
          pillar_id?: string | null
          posted_url?: string | null
          primary_keyword?: string | null
          publish_date?: string | null
          published_at?: string | null
          read_time?: string | null
          seo_md?: string | null
          slug?: string | null
          social_style?: string | null
          sort_order?: number
          status?: string
          title: string
          title_tag?: string | null
          updated_at?: string
        }
        Update: {
          ai_search_question?: string | null
          asset_url?: string | null
          attributes_best_guess?: boolean
          blog_style?: string | null
          body_html?: string | null
          brand_id?: string | null
          broadcast_id?: string | null
          campaign_id?: string | null
          category?: string | null
          category_slug?: string | null
          channel?: string
          copy_md?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_brief_md?: string | null
          image_style?: string | null
          image_type?: string | null
          image_url?: string | null
          language?: string
          meta_description?: string | null
          notes?: string | null
          page_meta?: Json
          parent_id?: string | null
          pillar?: string | null
          pillar_id?: string | null
          posted_url?: string | null
          primary_keyword?: string | null
          publish_date?: string | null
          published_at?: string | null
          read_time?: string | null
          seo_md?: string | null
          slug?: string | null
          social_style?: string | null
          sort_order?: number
          status?: string
          title?: string
          title_tag?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_calendar_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_calendar_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_calendar_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_calendar_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "marketing_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_calendar_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "marketing_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_pillars: {
        Row: {
          active: boolean
          brand_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_pillars_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_recaps: {
        Row: {
          generated_at: string
          id: string
          metrics: Json
          model: string | null
          period_month: string
          readout: string
          suggestions: Json
        }
        Insert: {
          generated_at?: string
          id?: string
          metrics?: Json
          model?: string | null
          period_month: string
          readout: string
          suggestions?: Json
        }
        Update: {
          generated_at?: string
          id?: string
          metrics?: Json
          model?: string | null
          period_month?: string
          readout?: string
          suggestions?: Json
        }
        Relationships: []
      }
      meetings: {
        Row: {
          created_at: string
          id: string
          person_id: string | null
          started_at: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          person_id?: string | null
          started_at: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          person_id?: string | null
          started_at?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_companies: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          is_primary: boolean
          ownership_pct: number | null
          person_id: string
          role: string
          start_date: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          ownership_pct?: number | null
          person_id: string
          role?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean
          ownership_pct?: number | null
          person_id?: string
          role?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_companies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      routine_runs: {
        Row: {
          ai_cache_read_tokens: number
          ai_cache_write_tokens: number
          ai_calls: number
          ai_input_tokens: number
          ai_output_tokens: number
          attempt: number
          created_at: string
          duration_ms: number | null
          error: string | null
          finished_at: string | null
          host: string
          id: string
          log: string | null
          mode: string
          result: Json | null
          routine_id: string
          started_at: string
          status: string
          step_deadline_at: string | null
          summary: string | null
          tick_key: string | null
          workflow_run_id: string | null
        }
        Insert: {
          ai_cache_read_tokens?: number
          ai_cache_write_tokens?: number
          ai_calls?: number
          ai_input_tokens?: number
          ai_output_tokens?: number
          attempt?: number
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          host: string
          id?: string
          log?: string | null
          mode?: string
          result?: Json | null
          routine_id: string
          started_at?: string
          status?: string
          step_deadline_at?: string | null
          summary?: string | null
          tick_key?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          ai_cache_read_tokens?: number
          ai_cache_write_tokens?: number
          ai_calls?: number
          ai_input_tokens?: number
          ai_output_tokens?: number
          attempt?: number
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          finished_at?: string | null
          host?: string
          id?: string
          log?: string | null
          mode?: string
          result?: Json | null
          routine_id?: string
          started_at?: string
          status?: string
          step_deadline_at?: string | null
          summary?: string | null
          tick_key?: string | null
          workflow_run_id?: string | null
        }
        Relationships: []
      }
      taggables: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taggables_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          kind: string | null
          label: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          kind?: string | null
          label: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          kind?: string | null
          label?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      deals: {
        Row: {
          amount_cents: number | null
          archived_at: string | null
          close_date: string | null
          company_id: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          lost_at: string | null
          person_id: string | null
          stage_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          won_at: string | null
        }
        Insert: {
          amount_cents?: number | null
          archived_at?: never
          close_date?: string | null
          company_id?: never
          created_at?: string | null
          currency?: string | null
          id?: string | null
          lost_at?: string | null
          person_id?: string | null
          stage_id?: never
          status?: string | null
          title?: never
          updated_at?: string | null
          won_at?: string | null
        }
        Update: {
          amount_cents?: number | null
          archived_at?: never
          close_date?: string | null
          company_id?: never
          created_at?: string | null
          currency?: string | null
          id?: string | null
          lost_at?: string | null
          person_id?: string | null
          stage_id?: never
          status?: string | null
          title?: never
          updated_at?: string | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
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
      campaign_recipient_stats: {
        Args: { p_campaign_id: string }
        Returns: {
          n: number
          status: string
        }[]
      }
      claim_campaign_batch: {
        Args: {
          p_campaign_id: string
          p_limit: number
          p_reclaim_after?: string
        }
        Returns: {
          email: string
          id: string
          person_id: string
        }[]
      }
      claim_tick: {
        Args: {
          p_host: string
          p_mode: string
          p_routine: string
          p_step_s: number
          p_tick: string
        }
        Returns: string
      }
      email_delivery_stats: {
        Args: { p_campaign_id?: string; p_since?: string }
        Returns: {
          event_type: string
          unique_emails: number
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
