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
      observations: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number
          location: unknown
          longitude: number
          sighting_name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          location: unknown
          longitude: number
          sighting_name: string
          updated_at?: string
        }
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sighting_name?: string;
          category?: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          location?: string;
          latitude?: number;
          longitude?: number;
          image_url?: string | null;
          description?: string | null;
          user_id?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          email?: string | null;
          type: 'normal' | 'scientist';
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          email?: string | null;
          type?: 'normal' | 'scientist';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          email?: string | null;
          type?: 'normal' | 'scientist';
          created_at?: string;
        };
      };
      scientists: {
        Row: {
          id: string;
          name: string;
          role: string;
          description?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          description?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          description?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          created_at?: string;
        };
      };
      project_locations: {
        Row: {
          id: string;
          project_id: string;
          location: any; // PostGIS POINT type
          label?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          location: any;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          location?: any;
          label?: string | null;
          created_at?: string;
        };
      };
    };
  };
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

export type Observation = Database['public']['Tables']['observations']['Row'];
export type ObservationInsert =
  Database['public']['Tables']['observations']['Insert'];
export type ObservationUpdate =
  Database['public']['Tables']['observations']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Scientist = Database['public']['Tables']['scientists']['Row'];
export type ScientistInsert = Database['public']['Tables']['scientists']['Insert'];
export type ScientistUpdate = Database['public']['Tables']['scientists']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProjectLocation = Database['public']['Tables']['project_locations']['Row'];
export type ProjectLocationInsert = Database['public']['Tables']['project_locations']['Insert'];
export type ProjectLocationUpdate = Database['public']['Tables']['project_locations']['Update'];
