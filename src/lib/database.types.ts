export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          email_notifications_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          email_notifications_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          email_notifications_enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: number;
          text: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          text: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          text?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_assignments: {
        Row: {
          user_id: string;
          date: string;
          challenge_id: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          challenge_id: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          date?: string;
          challenge_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_assignments_challenge_id_fkey';
            columns: ['challenge_id'];
            referencedRelation: 'challenges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_assignments_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      checkins: {
        Row: {
          user_id: string;
          date: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          completed: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          date?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'checkins_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      email_notifications: {
        Row: {
          token: string;
          user_id: string;
          date: string;
          challenge_id: number;
          sent_at: string | null;
          completed_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          token: string;
          user_id: string;
          date: string;
          challenge_id: number;
          sent_at?: string | null;
          completed_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          token?: string;
          user_id?: string;
          date?: string;
          challenge_id?: number;
          sent_at?: string | null;
          completed_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_notifications_challenge_id_fkey';
            columns: ['challenge_id'];
            referencedRelation: 'challenges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'email_notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
