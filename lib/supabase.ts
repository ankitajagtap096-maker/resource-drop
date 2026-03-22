import { createClient } from '@supabase/supabase-js'

// These values come from .env.local — never hard-coded in source
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createClient opens a connection to your Supabase project.
// Think of it like dialing a phone number — this line stores
// the number so we can call it whenever we need the database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This is the shape of one row in your "resources" table.
// TypeScript uses this to catch mistakes — if you try to read
// a column that doesn't exist, it'll warn you before you run anything.
export type Resource = {
  id: string
  title: string
  url: string
  tag: 'design' | 'product' | 'tech' | 'career' | 'general'
  submitted_by: string
  created_at: string
}
