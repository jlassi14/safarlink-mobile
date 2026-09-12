import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "fr" | "ar";
export type Theme = "light" | "dark" | "system";

export interface PendingEditDemand {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  nationality?: string;
  countryOfResidence?: string;
  dateOfBirth?: string;
  avatar?: string;
  referralCode?: string;
  rating?: number;
  role?: string;
  status?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  pendingEditDemand?: PendingEditDemand | null;
  lastEmailChangeDate?: string;
  lastPhoneChangeDate?: string;
}

interface AppState {
  // Language & Theme
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;

  // User
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateUser: (partialUser: Partial<User>) => void;
  logout: () => void;

  // UI
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Hydration state
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      theme: "system",
      user: null,
      isAuthenticated: false,
      darkMode: false,
      hasHydrated: false,

      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUser: (partialUser) =>
        set((state) => {
          const nextUser = state.user ? { ...state.user, ...partialUser } : null;
          return {
            user: nextUser,
            isAuthenticated: !!nextUser,
          };
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setDarkMode: (dark) => set({ darkMode: dark }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "safarlink-persistent-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
