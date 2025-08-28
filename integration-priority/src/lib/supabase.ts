import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      votes: {
        Row: {
          id: number
          restaurant_name: string
          mrr: number
          integration_name: string
          sales_person: string
          notes?: string
          created_at: string
        }
        Insert: {
          restaurant_name: string
          mrr: number
          integration_name: string
          sales_person: string
          notes?: string
        }
        Update: {
          restaurant_name?: string
          mrr?: number
          integration_name?: string
          sales_person?: string
          notes?: string
        }
      }
      integrations: {
        Row: {
          id: number
          name: string
          status: 'requested' | 'in_development' | 'completed'
          description?: string
          development_start?: string
          estimated_completion?: string
          created_at: string
        }
        Insert: {
          name: string
          status?: 'requested' | 'in_development' | 'completed'
          description?: string
          development_start?: string
          estimated_completion?: string
        }
        Update: {
          name?: string
          status?: 'requested' | 'in_development' | 'completed'
          description?: string
          development_start?: string
          estimated_completion?: string
        }
      }
    }
  }
}