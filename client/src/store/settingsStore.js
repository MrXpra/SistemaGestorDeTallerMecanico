/**
 * @file settingsStore.js
 * @description Store de configuración global de la aplicación con Zustand
 * 
 * Maneja configuraciones cargadas desde el backend (/api/settings):
 * - Información del negocio (nombre, logo, dirección, teléfono, email)
 * - Configuración fiscal (taxRate, currency, receiptFooter)
 * - Alertas (lowStockAlert, autoCreatePurchaseOrders, autoOrderThreshold)
 * - Integraciones (weatherLocation, weatherApiKey, showWeather)
 * - UI (toastPosition)
 * 
 * Acciones:
 * - setSettings(settings): Reemplazar toda la configuración (usado al cargar desde backend)
 * - updateSettings(updates): Actualizar parcialmente (merge con estado actual)
 * 
 * Uso:
 * const { settings, setSettings } = useSettingsStore();
 * 
 * Nota:
 * - Este store NO persiste en localStorage (se carga desde backend en cada sesión)
 * - La configuración se carga en Login.jsx después de autenticar
 */

import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  settings: {
    businessName: 'AutoParts Manager',
    businessLogoUrl: '/logo.png',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxRate: 0,
    currency: 'DOP',
    receiptFooter: '¡Gracias por su compra!',
    lowStockAlert: true,
    weatherLocation: 'Santo Domingo,DO',
    weatherApiKey: '',
    showWeather: true,
    autoCreatePurchaseOrders: false,
    autoOrderThreshold: 5,
    toastPosition: 'top-center',
  },
  setSettings: (settings) => set({ settings }),
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
}));
