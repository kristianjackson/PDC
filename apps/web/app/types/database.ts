export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          sleep_duration_hours: number | null;
          sleep_quality: number | null;
          wake_energy: number | null;
          body_weight: number | null;
          morning_mood: number | null;
          evening_mood: number | null;
          stress_level: number | null;
          productivity_level: number | null;
          caffeine_count: number;
          alcohol_count: number;
          exercise_completed: boolean;
          steps: number | null;
          meditation_completed: boolean;
          meaningful_social_contact: boolean;
          conflict_level: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          sleep_duration_hours?: number | null;
          sleep_quality?: number | null;
          wake_energy?: number | null;
          body_weight?: number | null;
          morning_mood?: number | null;
          evening_mood?: number | null;
          stress_level?: number | null;
          productivity_level?: number | null;
          caffeine_count?: number;
          alcohol_count?: number;
          exercise_completed?: boolean;
          steps?: number | null;
          meditation_completed?: boolean;
          meaningful_social_contact?: boolean;
          conflict_level?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          sleep_duration_hours?: number | null;
          sleep_quality?: number | null;
          wake_energy?: number | null;
          body_weight?: number | null;
          morning_mood?: number | null;
          evening_mood?: number | null;
          stress_level?: number | null;
          productivity_level?: number | null;
          caffeine_count?: number;
          alcohol_count?: number;
          exercise_completed?: boolean;
          steps?: number | null;
          meditation_completed?: boolean;
          meaningful_social_contact?: boolean;
          conflict_level?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weekly_entries: {
        Row: {
          id: string;
          user_id: string;
          week_end_date: string;
          training_consistency: number | null;
          nutrition_consistency: number | null;
          screen_time_estimate: number | null;
          inbox_pressure: number | null;
          social_connection: number | null;
          relationship_stability: number | null;
          travel_week: boolean;
          entertainment_load: number | null;
          reflection: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_end_date: string;
          training_consistency?: number | null;
          nutrition_consistency?: number | null;
          screen_time_estimate?: number | null;
          inbox_pressure?: number | null;
          social_connection?: number | null;
          relationship_stability?: number | null;
          travel_week?: boolean;
          entertainment_load?: number | null;
          reflection?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_end_date?: string;
          training_consistency?: number | null;
          nutrition_consistency?: number | null;
          screen_time_estimate?: number | null;
          inbox_pressure?: number | null;
          social_connection?: number | null;
          relationship_stability?: number | null;
          travel_week?: boolean;
          entertainment_load?: number | null;
          reflection?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      daily_entry_dashboard_summary: {
        Row: {
          user_id: string | null;
          total_days: number | null;
          avg_evening_mood: number | null;
          avg_stress_level: number | null;
          avg_productivity_level: number | null;
          avg_sleep_duration_hours: number | null;
        };
        Relationships: [];
      };
      weekly_entry_dashboard_summary: {
        Row: {
          user_id: string | null;
          total_weeks: number | null;
          avg_training_consistency: number | null;
          avg_nutrition_consistency: number | null;
          avg_social_connection: number | null;
          avg_relationship_stability: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
