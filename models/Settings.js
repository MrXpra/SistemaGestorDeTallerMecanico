/**
 * SETTINGS.JS - Modelo de Configuración del Sistema
 * 
 * Almacena toda la configuración personalizable de la aplicación.
 * Implementa patrón Singleton (solo existe un documento de settings).
 * 
 * Incluye configuración de:
 * - Datos del negocio (nombre, logo, contacto)
 * - Parámetros fiscales (impuestos, moneda)
 * - Alertas y umbrales (stock bajo, órdenes automáticas)
 * - Integraciones externas (clima, API keys)
 * - Preferencias de UI (posición de toast, footer de recibo)
 */

import mongoose from 'mongoose';

/**
 * ESQUEMA DE CONFIGURACIÓN
 * Solo existirá un documento de este tipo en la BD (Singleton)
 */
const settingsSchema = new mongoose.Schema({
  // ===== DATOS DEL NEGOCIO =====
  // Nombre del negocio (se muestra en sidebar y recibos)
  businessName: {
    type: String,
    default: 'AutoParts Manager'
  },
  
  // URL del logo (puede ser local o externa)
  businessLogoUrl: {
    type: String,
    default: '/default-logo.png'
  },
  
  // Dirección física del negocio
  businessAddress: {
    type: String,
    default: ''
  },
  
  // Teléfono de contacto
  businessPhone: {
    type: String,
    default: ''
  },
  
  // Email de contacto
  businessEmail: {
    type: String,
    default: ''
  },
  
  // ===== CONFIGURACIÓN FISCAL =====
  // Tasa de impuesto (ITBIS en RD = 18%)
  taxRate: {
    type: Number,
    default: 0, // 0 = sin impuesto, 18 = 18%
    min: 0,
    max: 100
  },
  
  // Moneda del sistema
  currency: {
    type: String,
    default: 'DOP' // Peso Dominicano
  },
  
  // ===== CONFIGURACIÓN DE RECIBOS =====
  // Texto que aparece al pie del recibo
  receiptFooter: {
    type: String,
    default: '¡Gracias por su compra!'
  },
  
  // ===== ALERTAS Y NOTIFICACIONES =====
  // Activar alertas de stock bajo
  lowStockAlert: {
    type: Boolean,
    default: true
  },
  
  // ===== INTEGRACIÓN DE CLIMA =====
  // Ubicación para obtener clima (formato: Ciudad,País)
  weatherLocation: {
    type: String,
    default: 'Santo Domingo,DO'
  },
  
  // API Key de OpenWeatherMap (opcional)
  weatherApiKey: {
    type: String,
    default: ''
  },
  
  // Mostrar widget de clima en dashboard
  showWeather: {
    type: Boolean,
    default: true
  },
  
  // ===== ÓRDENES AUTOMÁTICAS =====
  // Crear órdenes de compra automáticamente cuando stock es bajo
  autoCreatePurchaseOrders: {
    type: Boolean,
    default: false
  },
  
  // Umbral de stock para generar orden automática
  autoOrderThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  
  // ===== PREFERENCIAS DE UI =====
  // Posición de las notificaciones toast
  toastPosition: {
    type: String,
    enum: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    default: 'top-center'
  },
  
  // Fecha de última actualización
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * MÉTODO ESTÁTICO: getInstance
 * 
 * Implementa patrón Singleton: siempre retorna el mismo documento.
 * Si no existe configuración, crea una con valores por defecto.
 * 
 * @returns {Promise<Document>} El único documento de configuración
 * 
 * Uso:
 * const settings = await Settings.getInstance();
 */
settingsSchema.statics.getInstance = async function() {
  // Buscar el documento de settings
  let settings = await this.findOne();
  
  // Si no existe, crear uno con valores por defecto
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

// Crear modelo a partir del esquema
const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
