"use client";

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { normalizeEmail } from "@/lib/auth";

type AuthStore = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  init: () => () => void;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
};

function authNotConfigured() {
  return { ok: false, error: "Supabase не настроен (.env.local)" };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  init: () => {
    if (!isSupabaseConfigured()) {
      set({ loading: false, initialized: true });
      return () => {};
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });
    });

    return () => subscription.unsubscribe();
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured()) return authNotConfigured();
    const norm = normalizeEmail(email);
    if (!norm.includes("@") || password.length < 6) {
      return { ok: false, error: "Почта и пароль (мин. 6 символов)" };
    }
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/profile`;
    const { data, error } = await supabase.auth.signUp({
      email: norm,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    const needsEmailConfirm = !data.session;
    return { ok: true, needsEmailConfirm };
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) return authNotConfigured();
    const norm = normalizeEmail(email);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: norm,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  requestPasswordReset: async (email) => {
    if (!isSupabaseConfigured()) return authNotConfigured();
    const norm = normalizeEmail(email);
    if (!norm.includes("@")) {
      return { ok: false, error: "Укажите email" };
    }
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(norm, {
      redirectTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  updatePassword: async (newPassword) => {
    if (!isSupabaseConfigured()) return authNotConfigured();
    if (newPassword.length < 6) {
      return { ok: false, error: "Пароль минимум 6 символов" };
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },
}));
