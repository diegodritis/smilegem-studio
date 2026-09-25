import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface UserProfile {
  id: string
  email: string
  name: string
  handle: string
}

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

const LOCAL_SESSION_KEY = 'smilegem_auth_session'
const LOCAL_USERS_KEY = 'smilegem_auth_users'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    set({ isLoading: true, error: null })

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          const u = data.session.user
          set({
            user: {
              id: u.id,
              email: u.email || '',
              name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Artista',
              handle: (u.user_metadata?.handle as string) || `@${u.email?.split('@')[0]}`,
            },
            isLoading: false,
          })
          return
        }
      } catch (err) {
        console.warn('Supabase auth session check:', err)
      }
    } else {
      // Proveedor de sesión local para desarrollo
      try {
        const saved = localStorage.getItem(LOCAL_SESSION_KEY)
        if (saved) {
          const profile: UserProfile = JSON.parse(saved)
          set({ user: profile, isLoading: false })
          return
        }
      } catch (e) {
        console.error('Local auth load error:', e)
      }
    }

    set({ user: null, isLoading: false })
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null })
    const trimmedEmail = email.trim().toLowerCase()
    const artistName = name?.trim() || trimmedEmail.split('@')[0]
    const handle = `@${trimmedEmail.split('@')[0]}`

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { name: artistName, handle },
          },
        })
        if (error) throw error
        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: artistName,
              handle,
            },
            isLoading: false,
          })
          return true
        }
      } catch (err: any) {
        set({ error: err.message || 'Error al crear la cuenta', isLoading: false })
        return false
      }
    }

    // Proveedor local
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY) || '[]'
      const users: Array<UserProfile & { passwordHash: string }> = JSON.parse(usersRaw)
      if (users.some((u) => u.email === trimmedEmail)) {
        set({ error: 'Ya existe una cuenta registrada con este correo', isLoading: false })
        return false
      }

      const newUser: UserProfile & { passwordHash: string } = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: trimmedEmail,
        name: artistName,
        handle,
        passwordHash: password,
      }

      users.push(newUser)
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))

      const profile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        handle: newUser.handle,
      }
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile))
      set({ user: profile, isLoading: false })
      return true
    } catch (e: any) {
      set({ error: 'Error al registrar usuario', isLoading: false })
      return false
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    const trimmedEmail = email.trim().toLowerCase()

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (error) throw error
        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: (data.user.user_metadata?.name as string) || trimmedEmail.split('@')[0],
              handle: (data.user.user_metadata?.handle as string) || `@${trimmedEmail.split('@')[0]}`,
            },
            isLoading: false,
          })
          return true
        }
      } catch (err: any) {
        set({ error: err.message || 'Credenciales incorrectas', isLoading: false })
        return false
      }
    }

    // Proveedor local
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY) || '[]'
      const users: Array<UserProfile & { passwordHash: string }> = JSON.parse(usersRaw)
      const found = users.find((u) => u.email === trimmedEmail && u.passwordHash === password)
      if (!found) {
        set({ error: 'Correo o contraseña incorrectos', isLoading: false })
        return false
      }

      const profile: UserProfile = {
        id: found.id,
        email: found.email,
        name: found.name,
        handle: found.handle,
      }
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile))
      set({ user: profile, isLoading: false })
      return true
    } catch (e) {
      set({ error: 'Error al iniciar sesión', isLoading: false })
      return false
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Supabase sign out error:', e)
      }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY)
    set({ user: null, isLoading: false })
  },
}))
