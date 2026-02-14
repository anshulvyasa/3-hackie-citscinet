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
      observations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          sighting_name: string;
          category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          location: string;
          latitude: number;
          longitude: number;
          image_url: string | null;
          description: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sighting_name: string;
          category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
          location: string;
          latitude: number;
          longitude: number;
          image_url?: string | null;
          description?: string | null;
          user_id?: string | null;
        };
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
    };
  };
}

export type Observation = Database['public']['Tables']['observations']['Row'];
export type ObservationInsert =
  Database['public']['Tables']['observations']['Insert'];
export type ObservationUpdate =
  Database['public']['Tables']['observations']['Update'];
