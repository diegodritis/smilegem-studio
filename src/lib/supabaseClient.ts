import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Variables de entorno de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Cliente oficial de Supabase si las credenciales están configuradas en .env.
 * Si no están configuradas aún, se mantiene como null y el sistema opera
 * transparentemente con el proveedor local integrado para desarrollo.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
