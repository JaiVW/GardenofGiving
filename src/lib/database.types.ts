export type Database = {
  public: {
    Tables: {
      garden_notes: {
        Row: {
          id: number;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
