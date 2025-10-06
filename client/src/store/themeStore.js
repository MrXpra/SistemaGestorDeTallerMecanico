/**
 * @file themeStore.js
 * @description Store del tema claro/oscuro con Zustand
 * 
 * Maneja el estado del tema visual de la aplicación:
 * - isDarkMode: Boolean que indica si el modo oscuro está activo
 * 
 * Acciones:
 * - toggleTheme(): Alternar entre claro/oscuro
 * - setDarkMode(isDark): Establecer tema específico
 * 
 * Persistencia:
 * - Usa middleware 'persist' para guardar en localStorage
 * - Clave: 'theme-storage'
 * - Al recargar la página, se restaura el tema guardado
 * 
 * Uso en App.jsx:
 * const { isDarkMode } = useThemeStore();
 * return <div className={isDarkMode ? 'dark' : ''}> // Tailwind dark mode
 * 
 * Uso en componentes:
 * const { isDarkMode, toggleTheme } = useThemeStore();
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,

      toggleTheme: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
