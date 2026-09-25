import type { Gem } from '../store/useGemsStore'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { useAuthStore } from '../store/useAuthStore'

export interface SavedDesign {
  id: string
  title: string
  clientName: string
  notes: string
  createdAt: string
  backgroundId: string
  gems: Gem[]
  isPublished?: boolean
  user_id?: string
}

const GUEST_STORAGE_KEY = 'smilegem_saved_designs'

function getUserStorageKey(userId: string) {
  return `smilegem_designs_user_${userId}`
}

/**
 * Obtiene los diseños guardados. Si el usuario está autenticado, recupera
 * sus diseños correspondientes (y sincroniza con la base de datos si Supabase está activo).
 */
export function getSavedDesigns(): SavedDesign[] {
  const currentUser = useAuthStore.getState().user
  const key = currentUser ? getUserStorageKey(currentUser.id) : GUEST_STORAGE_KEY

  try {
    const raw = localStorage.getItem(key)
    const list: SavedDesign[] = raw ? JSON.parse(raw) : []

    // Sincronización en segundo plano con base de datos si está conectado
    if (currentUser && isSupabaseConfigured && supabase) {
      supabase
        .from('designs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .then(
          ({ data, error }) => {
            if (!error && data && data.length > 0) {
              const mapped: SavedDesign[] = data.map((d: any) => ({
                id: d.id,
                title: d.title,
                clientName: d.client_name,
                notes: d.notes,
                createdAt: d.created_at,
                backgroundId: d.background_id,
                gems: d.gems,
                isPublished: d.is_published,
                user_id: d.user_id,
              }))
              localStorage.setItem(key, JSON.stringify(mapped))
            }
          },
          (e: any) => console.warn('Cloud sync error:', e)
        )
    }

    return list
  } catch (e) {
    console.error('Error reading saved designs:', e)
    return []
  }
}

/**
 * Guarda un diseño. Si el usuario está autenticado, lo asocia a su user_id
 * y lo envía a la base de datos (con fallback seguro en almacenamiento local).
 */
export function saveDesign(design: Omit<SavedDesign, 'id' | 'createdAt'>): SavedDesign {
  const currentUser = useAuthStore.getState().user
  const key = currentUser ? getUserStorageKey(currentUser.id) : GUEST_STORAGE_KEY
  const designs = getSavedDesigns()

  const newDesign: SavedDesign = {
    ...design,
    id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    user_id: currentUser ? currentUser.id : undefined,
  }

  const updated = [newDesign, ...designs]
  localStorage.setItem(key, JSON.stringify(updated))

  // Persistir en base de datos si Supabase está activo
  if (currentUser && isSupabaseConfigured && supabase) {
    supabase
      .from('designs')
      .insert({
        id: newDesign.id,
        user_id: currentUser.id,
        title: newDesign.title,
        client_name: newDesign.clientName,
        notes: newDesign.notes,
        created_at: newDesign.createdAt,
        background_id: newDesign.backgroundId,
        gems: newDesign.gems,
        is_published: newDesign.isPublished ?? true,
      })
      .then(
        ({ error }) => {
          if (error) console.warn('Supabase insert design error:', error)
        },
        (e: any) => console.warn('Supabase insert design exception:', e)
      )
  }

  return newDesign
}

export function updateDesign(id: string, updates: Partial<SavedDesign>): void {
  const currentUser = useAuthStore.getState().user
  const key = currentUser ? getUserStorageKey(currentUser.id) : GUEST_STORAGE_KEY
  const designs = getSavedDesigns()

  const updated = designs.map((d) => (d.id === id ? { ...d, ...updates } : d))
  localStorage.setItem(key, JSON.stringify(updated))

  if (currentUser && isSupabaseConfigured && supabase) {
    const payload: any = {}
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.clientName !== undefined) payload.client_name = updates.clientName
    if (updates.notes !== undefined) payload.notes = updates.notes
    if (updates.isPublished !== undefined) payload.is_published = updates.isPublished
    if (updates.gems !== undefined) payload.gems = updates.gems

    supabase
      .from('designs')
      .update(payload)
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .then(
        ({ error }) => {
          if (error) console.warn('Supabase update error:', error)
        },
        (e: any) => console.warn('Supabase update exception:', e)
      )
  }
}

export function deleteDesign(id: string): void {
  const currentUser = useAuthStore.getState().user
  const key = currentUser ? getUserStorageKey(currentUser.id) : GUEST_STORAGE_KEY
  const designs = getSavedDesigns()

  const updated = designs.filter((d) => d.id !== id)
  localStorage.setItem(key, JSON.stringify(updated))

  if (currentUser && isSupabaseConfigured && supabase) {
    supabase
      .from('designs')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .then(
        ({ error }) => {
          if (error) console.warn('Supabase delete error:', error)
        },
        (e: any) => console.warn('Supabase delete exception:', e)
      )
  }
}

/**
 * Obtiene diseños públicos (Fase 13c) para un showcase accesible sin sesión iniciada.
 * Filtra estrictamente solo aquellos marcados como `isPublished: true`.
 */
export function getPublicDesigns(_targetUserIdOrHandle?: string): SavedDesign[] {
  // Fallback local y en memoria: recuperar todos los diseños públicos guardados
  const allDesigns: SavedDesign[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key === GUEST_STORAGE_KEY || key.startsWith('smilegem_designs_user_'))) {
      try {
        const parsed: SavedDesign[] = JSON.parse(localStorage.getItem(key) || '[]')
        allDesigns.push(...parsed)
      } catch (e) {
        // Ignorar
      }
    }
  }

  // Filtrar estrictamente solo diseños con isPublished !== false
  return allDesigns.filter((d) => d.isPublished !== false)
}
