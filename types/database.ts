export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          question_text: string;
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          question_text: string;
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          question_text?: string;
          explanation?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      quiz_submissions: {
        Row: {
          id: string;
          user_name: string;
          lga: string | null;
          score: number;
          total_questions: number;
          badge_title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_name: string;
          lga?: string | null;
          score: number;
          total_questions: number;
          badge_title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_name?: string;
          lga?: string | null;
          score?: number;
          total_questions?: number;
          badge_title?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      birthday_wishes: {
        Row: {
          id: string;
          author_name: string;
          lga: string | null;
          wish_text: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          lga?: string | null;
          wish_text: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          lga?: string | null;
          wish_text?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_letters: {
        Row: {
          id: string;
          day_number: number;
          publish_date: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_number: number;
          publish_date: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_number?: number;
          publish_date?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_traffic: {
        Row: {
          id: string;
          device_id: string;
          ip_address: string;
          country_code: string;
          page_route: string;
          visited_at: string;
          first_seen_at?: string;
          total_visits?: number;
          route_history?: Array<{ route: string; timestamp: string }> | null;
          session_id?: string | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          ip_address?: string;
          country_code?: string;
          page_route?: string;
          visited_at?: string;
          first_seen_at?: string;
          total_visits?: number;
          route_history?: Array<{ route: string; timestamp: string }> | null;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          device_id?: string;
          ip_address?: string;
          country_code?: string;
          page_route?: string;
          visited_at?: string;
          first_seen_at?: string;
          total_visits?: number;
          route_history?: Array<{ route: string; timestamp: string }> | null;
          session_id?: string | null;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          id: number;
          confetti_start_time: string | null;
          confetti_end_time: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          confetti_start_time?: string | null;
          confetti_end_time?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          confetti_start_time?: string | null;
          confetti_end_time?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

    };
    Views: {
      public_quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      evaluate_quiz_submission: {
        Args: {
          p_answers: Json;
        };
        Returns: {
          calculated_score: number;
          total_questions: number;
        }[];
      };
    };
  };
}

// Convenient Domain Types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Option = Database["public"]["Tables"]["options"]["Row"];
export type PublicQuizOption = Database["public"]["Views"]["public_quiz_options"]["Row"];
export type QuizSubmission = Database["public"]["Tables"]["quiz_submissions"]["Row"];
export type BirthdayWish = Database["public"]["Tables"]["birthday_wishes"]["Row"];
export type DailyLetter = Database["public"]["Tables"]["daily_letters"]["Row"];
export type SiteTraffic = Database["public"]["Tables"]["site_traffic"]["Row"];
export type PlatformSettings = Database["public"]["Tables"]["platform_settings"]["Row"];


export interface AnswerSubmissionItem {
  question_id: string;
  selected_option_id: string;
}

export interface QuizEvaluationResult {
  calculated_score: number;
  total_questions: number;
}

export interface QuestionWithOptions {
  id: string;
  category_id: string;
  question_text: string;
  explanation: string | null;
  category?: {
    name: string;
    slug: string;
  };
  options: PublicQuizOption[];
}

// 31 Local Government Areas of Akwa Ibom State
export const AKWA_IBOM_LGAS = [
  "Abak",
  "Eastern Obolo",
  "Eket",
  "Esit Eket",
  "Essien Udim",
  "Etim Ekpo",
  "Etinan",
  "Ibeno",
  "Ibesikpo Asutan",
  "Ibiono Ibom",
  "Ika",
  "Ikono",
  "Ikot Abasi",
  "Ikot Ekpene",
  "Ini",
  "Itu",
  "Mbo",
  "Mkpat Enin",
  "Nsit Atai",
  "Nsit Ibom",
  "Nsit Ubium",
  "Obot Akara",
  "Okobo",
  "Onna",
  "Oron",
  "Oruk Anam",
  "Udung Uko",
  "Ukanafun",
  "Uruan",
  "Urue-Offong/Oruko",
  "Uyo",
] as const;

export type AkwaIbomLGA = (typeof AKWA_IBOM_LGAS)[number];
