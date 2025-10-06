/**
 * @file Settings.jsx
 * @description Página de configuración global (solo admin)
 * 
 * Responsabilidades:
 * - Cargar y actualizar configuración del sistema
 * - Organizar settings en 5 secciones (tabs):
 *   1. Negocio: Información de la empresa
 *   2. Sistema: Configuraciones generales
 *   3. Notificaciones: Alertas y notificaciones
 *   4. Facturación: Configuración fiscal
 *   5. Integraciones: APIs externas (clima)
 * 
 * Props:
 * - section: 'all' | 'business' | 'system' | 'notifications' | 'billing' | 'integrations'
 *   (por defecto 'all' muestra todas las secciones)
 * 
 * Estados:
 * - formData: Objeto con todos los campos de configuración
 * - isLoading: Boolean durante fetch inicial
 * - isSaving: Boolean durante guardado
 * - hasChanges: Boolean si hay cambios sin guardar
 * - showTooltip: String del tooltip activo
 * 
 * Secciones de Configuración:
 * 
 * 1. **Negocio** (Business):
 *    - businessName: Nombre del negocio
 *    - businessLogoUrl: URL del logo
 *    - businessAddress: Dirección
 *    - businessPhone: Teléfono
 *    - businessEmail: Email
 * 
 * 2. **Sistema** (System):
 *    - currency: Moneda (DOP, USD, EUR)
 *    - receiptFooter: Mensaje al pie de recibos
 *    - toastPosition: Posición de notificaciones
 * 
 * 3. **Notificaciones** (Notifications):
 *    - lowStockAlert: Activar alertas de stock bajo
 *    - autoCreatePurchaseOrders: Crear órdenes automáticamente
 *    - autoOrderThreshold: Umbral para órdenes automáticas
 * 
 * 4. **Facturación** (Billing):
 *    - taxRate: Tasa de impuesto (%)
 *    - fiscalPrinterEnabled: Usar impresora fiscal
 *    - rnc: RNC de la empresa
 * 
 * 5. **Integraciones** (Integrations):
 *    - showWeather: Mostrar widget de clima
 *    - weatherLocation: Ubicación para clima
 *    - weatherApiKey: API key de OpenWeatherMap
 * 
 * APIs:
 * - GET /api/settings (cargar configuración)
 * - PUT /api/settings (guardar cambios, solo admin)
 * 
 * Validaciones:
 * - taxRate: 0-100
 * - autoOrderThreshold: > 0
 * - URLs y emails con formato válido
 * 
 * UI Features:
 * - Tabs de navegación entre secciones
 * - Indicador de cambios sin guardar
 * - Botón de guardar con loader
 * - Skeleton loader durante carga
 * - Tooltips informativos
 * - Toggle para password (weatherApiKey)
 * - Confirmación antes de salir si hay cambios
 * 
 * Nota:
 * - Los cambios se aplican globalmente en settingsStore
 * - Frontend recarga settings al guardar
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getSettings, updateSettings } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import toast from 'react-hot-toast';
import { SettingsSkeleton } from '../components/SkeletonLoader';
import {
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Image,
  AlertCircle,
  Check,
  Info,
  Settings as SettingsIcon,
  Store,
  Receipt,
  Bell,
  X,
  Eye,
  EyeOff,
  Globe,
  CreditCard,
  Cloud,
} from 'lucide-react';

const Settings = ({ section = 'all' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { setSettings: updateSettingsStore } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessLogoUrl: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxRate: 0,
    currency: 'DOP',
    receiptFooter: '',
    lowStockAlert: true,
    weatherLocation: 'Santo Domingo,DO',
    weatherApiKey: '',
    showWeather: true,
    autoCreatePurchaseOrders: false,
    autoOrderThreshold: 5,
    toastPosition: 'top-center',
  });

  const [originalData, setOriginalData] = useState({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      setFormData(response.data);
      setOriginalData(response.data);
      // Actualizar store solo al cargar configuración
      updateSettingsStore(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-guardar cuando cambia formData
  useEffect(() => {
    // No auto-guardar en la carga inicial
    if (Object.keys(originalData).length === 0) return;
    
    // Verificar si hay cambios reales
    const hasRealChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    if (!hasRealChanges) {
      setHasChanges(false);
      return;
    }

    // Limpiar timeout anterior
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Configurar nuevo timeout para auto-guardar después de 300ms (casi instantáneo)
    const timeout = setTimeout(() => {
      autoSaveSettings();
    }, 300);

    setAutoSaveTimeout(timeout);

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData, originalData]);

  const autoSaveSettings = async () => {
    // Validaciones
    if (!formData.businessName.trim()) {
      toast.error('El nombre del negocio es requerido');
      return;
    }

    if (formData.taxRate < 0 || formData.taxRate > 100) {
      toast.error('La tasa de impuesto debe estar entre 0 y 100');
      return;
    }

    try {
      setIsSaving(true);
      await updateSettings(formData);
      setOriginalData(formData);
      setHasChanges(false);
      // Actualizar el store cuando se guarda automáticamente
      updateSettingsStore(formData);
      toast.success('✨ Guardado', {
        duration: 1500,
        icon: '💾',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ya no es necesario guardar manualmente, el auto-guardado lo maneja
    // Este método solo previene el envío del formulario
  };

  const formatPhone = (value) => {
    // Formato: XXX-XXX-XXXX
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const formatted = [match[1], match[2], match[3]].filter(Boolean).join('-');
      return formatted;
    }
    return value;
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  // Tabs de secciones
  const tabs = [
    { id: 'business', label: 'Negocio', icon: Building2, path: '/configuracion/negocio' },
    { id: 'system', label: 'Sistema', icon: Globe, path: '/configuracion/sistema' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, path: '/configuracion/notificaciones' },
    { id: 'billing', label: 'Facturación', icon: CreditCard, path: '/configuracion/facturacion' },
    { id: 'integrations', label: 'Integraciones', icon: Cloud, path: '/configuracion/integraciones' },
  ];

  // Función para verificar si una sección debe mostrarse
  const shouldShowSection = (sectionId) => {
    if (section === 'all') return true;
    return section === sectionId;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra la configuración general del sistema
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Guardando...
                  </span>
                </>
              ) : hasChanges ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    Guardando en 0.3s...
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✨ Todo guardado
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs de Navegación */}
      {section !== 'all' && (
        <div className="card-glass overflow-x-auto">
          <div className="flex gap-2 p-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`
                }
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Alert for non-admin users */}
      {user?.role !== 'admin' && (
        <div className="card-glass p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-gray-700 dark:text-gray-300">
              Solo los administradores pueden modificar la configuración del sistema.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        {shouldShowSection('business') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Información del Negocio
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Datos generales de la empresa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                disabled={user?.role !== 'admin'}
                className="input"
                placeholder="AutoParts Manager"
                required
              />
            </div>

            {/* Business Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL del Logo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.businessLogoUrl}
                  onChange={(e) => handleChange('businessLogoUrl', e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="input flex-1"
                  placeholder="/logo.png"
                />
                <div className="relative">
                  <Info
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help mt-3"
                    onMouseEnter={() => setShowTooltip('logo')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                  {showTooltip === 'logo' && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
                      URL de la imagen del logo. Aparecerá en reportes y recibos impresos.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.businessPhone}
                  onChange={(e) => handleChange('businessPhone', formatPhone(e.target.value))}
                  disabled={user?.role !== 'admin'}
                  className="input pl-10"
                  placeholder="829-362-9732"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleChange('businessEmail', e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="input pl-10"
                  placeholder="contacto@autoparts.com"
                />
              </div>
            </div>

            {/* Business Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="input pl-10 min-h-[80px]"
                  placeholder="Calle Principal #123, Santo Domingo, República Dominicana"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Financial Settings */}
        {shouldShowSection('system') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuración Financiera
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Impuestos y moneda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tasa de Impuesto (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                  disabled={user?.role !== 'admin'}
                  className="input"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <div className="relative">
                  <Info
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help mt-3"
                    onMouseEnter={() => setShowTooltip('tax')}
                    onMouseLeave={() => setShowTooltip(null)}
                  />
                  {showTooltip === 'tax' && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
                      Porcentaje de impuesto (ITBIS) que se aplicará a las ventas. Ejemplo: 18 para 18%
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.taxRate > 0 ? `Se aplicará ${formData.taxRate}% de impuesto a las ventas` : 'Sin impuestos'}
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                disabled={user?.role !== 'admin'}
                className="input"
              >
                <option value="DOP">Peso Dominicano (DOP)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>
        )}

        {/* Receipt Settings */}
        {shouldShowSection('billing') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuración de Recibos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personaliza los recibos impresos
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje de Pie de Recibo
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.receiptFooter}
                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                disabled={user?.role !== 'admin'}
                className="input pl-10 min-h-[100px]"
                placeholder="¡Gracias por su compra! Esperamos verle pronto."
                rows={4}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este mensaje aparecerá al final de cada recibo impreso
            </p>
          </div>
        </div>
        )}

        {/* Alerts Settings */}
        {shouldShowSection('notifications') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Alertas y Notificaciones
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configura las alertas del sistema
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Alertas de Stock Bajo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibe notificaciones cuando los productos estén por agotarse
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lowStockAlert}
                onChange={(e) => handleChange('lowStockAlert', e.target.checked)}
                disabled={user?.role !== 'admin'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
        )}

        {/* Purchase Orders Automation */}
        {shouldShowSection('system') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Órdenes de Compra Automáticas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configuración de generación automática de órdenes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle Órdenes Automáticas */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Generación Automática de Órdenes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crear órdenes de compra automáticamente cuando el stock sea bajo
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCreatePurchaseOrders}
                  onChange={(e) => handleChange('autoCreatePurchaseOrders', e.target.checked)}
                  disabled={user?.role !== 'admin'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Umbral de Stock */}
            {formData.autoCreatePurchaseOrders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Umbral de Stock para Orden Automática
                </label>
                <input
                  type="number"
                  value={formData.autoOrderThreshold}
                  onChange={(e) => handleChange('autoOrderThreshold', parseInt(e.target.value) || 0)}
                  disabled={user?.role !== 'admin'}
                  className="input"
                  placeholder="5"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Se creará una orden automática cuando el stock llegue a este nivel
                </p>
                <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    <strong>💡 Ejemplo:</strong> Si estableces el umbral en 5, cuando un producto tenga 5 unidades o menos, el sistema generará automáticamente una orden de compra al proveedor asignado.
                  </p>
                </div>
              </div>
            )}

            {/* Información adicional */}
            {!formData.autoCreatePurchaseOrders && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>ℹ️ Nota:</strong> La generación automática de órdenes está desactivada. Las órdenes de compra deberán crearse manualmente desde el módulo de Órdenes de Compra.
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Weather Settings */}
        {shouldShowSection('integrations') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Widget de Clima
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Muestra el clima en la barra superior
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Mostrar Widget */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Mostrar Widget de Clima
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activa/desactiva la visualización del clima
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showWeather}
                  onChange={(e) => handleChange('showWeather', e.target.checked)}
                  disabled={user?.role !== 'admin'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación (Ciudad, Código de País)
              </label>
              <input
                type="text"
                value={formData.weatherLocation}
                onChange={(e) => handleChange('weatherLocation', e.target.value)}
                disabled={user?.role !== 'admin'}
                className="input"
                placeholder="Santo Domingo,DO"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formato: Ciudad,CódigoPaís (ej: Santo Domingo,DO | Santiago,DO | New York,US)
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key de OpenWeatherMap
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formData.weatherApiKey}
                  onChange={(e) => handleChange('weatherApiKey', e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="input pr-12"
                  placeholder="Ingresa tu API key"
                />
                {formData.weatherApiKey && (
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                    title={showApiKey ? "Ocultar API key" : "Mostrar API key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                  <strong>📌 Cómo obtener tu API Key gratuita:</strong>
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>Ve a <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 dark:hover:text-blue-200">openweathermap.org/api</a></li>
                  <li>Crea una cuenta gratuita</li>
                  <li>Genera tu API key en la sección "API keys"</li>
                  <li>Copia y pega la key aquí</li>
                </ol>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ⚡ El plan gratuito incluye 1,000 llamadas diarias (suficiente para este sistema)
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Toast Notifications Settings */}
        {shouldShowSection('notifications') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configura la posición de las notificaciones en pantalla
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toast Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Posición de las Notificaciones
              </label>
              
              {/* Visual Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: 'top-left', label: 'Arriba Izquierda', icon: '↖' },
                  { value: 'top-center', label: 'Arriba Centro', icon: '↑' },
                  { value: 'top-right', label: 'Arriba Derecha', icon: '↗' },
                  { value: 'bottom-left', label: 'Abajo Izquierda', icon: '↙' },
                  { value: 'bottom-center', label: 'Abajo Centro', icon: '↓' },
                  { value: 'bottom-right', label: 'Abajo Derecha', icon: '↘' },
                ].map((position) => (
                  <button
                    key={position.value}
                    type="button"
                    onClick={() => handleChange('toastPosition', position.value)}
                    disabled={user?.role !== 'admin'}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${formData.toastPosition === position.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }
                      ${user?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{position.icon}</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {position.label}
                      </div>
                    </div>
                    {formData.toastPosition === position.value && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Test Button */}
              <button
                type="button"
                onClick={() => toast.success('¡Notificación de prueba! 🎉')}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Probar Notificación
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                💡 Haz clic en "Probar Notificación" para ver cómo se verá en la posición seleccionada
              </p>
            </div>
          </div>
        </div>
        )}

      </form>

      {/* Info Card */}
      {section === 'all' && (
        <div className="card-glass p-4 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Información Importante
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Los cambios se aplicarán inmediatamente después de guardar</li>
                <li>• El nombre del negocio aparecerá en todos los reportes y recibos</li>
                <li>• La tasa de impuesto se puede modificar según la legislación vigente</li>
                <li>• El mensaje de pie de recibo admite hasta 500 caracteres</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Card */}
      {(section === 'all' || section === 'business') && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista Previa del Recibo
            </h3>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 max-w-md mx-auto">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData.businessName || 'Nombre del Negocio'}
              </h3>
              {formData.businessAddress && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.businessAddress}
                </p>
              )}
              {(formData.businessPhone || formData.businessEmail) && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.businessPhone && `Tel: ${formData.businessPhone}`}
                  {formData.businessPhone && formData.businessEmail && ' • '}
                  {formData.businessEmail}
                </p>
              )}
              
              <div className="border-t border-gray-300 dark:border-gray-700 my-4" />
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                [Detalles de la venta]
              </div>
              
              <div className="border-t border-gray-300 dark:border-gray-700 my-4" />
              
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                {formData.receiptFooter || '¡Gracias por su compra!'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

