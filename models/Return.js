/**
 * RETURN.JS - Modelo de Devolución
 * 
 * Gestiona devoluciones de productos vendidos.
 * Permite devolver items, actualizar inventario y procesar reembolsos.
 * 
 * Flujo:
 * 1. Cajero crea devolución (status: Pendiente)
 * 2. Admin aprueba/rechaza
 * 3. Si aprueba: devuelve stock + procesa reembolso (status: Completada)
 * 4. Si rechaza: no se devuelve nada (status: Rechazada)
 */

import mongoose from 'mongoose';

/**
 * ESQUEMA DE DEVOLUCIÓN
 */
const returnSchema = new mongoose.Schema({
  // Número único de devolución (formato: DEV-000001)
  returnNumber: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Venta original de donde se devuelven productos
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  
  // Cliente que realiza la devolución
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  
  // Items devueltos
  items: [{
    // Producto devuelto
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Cantidad devuelta
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Precio original del producto en la venta
    originalPrice: {
      type: Number,
      required: true,
    },
    // Monto a devolver por este item
    returnAmount: {
      type: Number,
      required: true,
    },
    // Flag para productos defectuosos (no vuelven al stock normal)
    isDefective: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Razón de la devolución
  reason: {
    type: String,
    required: true,
    enum: ['Defectuoso', 'Incorrecto', 'No necesario', 'Cambio', 'Otro'],
  },
  
  // Notas adicionales sobre la devolución
  notes: {
    type: String,
  },
  
  // Monto total a devolver
  totalAmount: {
    type: Number,
    required: true,
  },
  
  // Método de reembolso
  refundMethod: {
    type: String,
    required: true,
    enum: ['Efectivo', 'Tarjeta', 'Crédito en Tienda'],
  },
  
  // Estado de la devolución
  status: {
    type: String,
    enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Completada'],
    default: 'Pendiente',
  },
  
  // Usuario (cajero) que procesó la devolución
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Usuario (admin) que aprobó la devolución
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt
});

/**
 * MIDDLEWARE PRE-VALIDATE
 * Genera número de devolución automático
 * Formato: DEV-000001, DEV-000002, etc
 */
returnSchema.pre('validate', async function(next) {
  if (this.isNew && !this.returnNumber) {
    try {
      // Contar devoluciones existentes
      const count = await this.constructor.countDocuments();
      // Generar número con padding de 6 dígitos
      this.returnNumber = `DEV-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Fallback: usar timestamp
      this.returnNumber = `DEV-${String(Date.now()).slice(-6)}`;
    }
  }
  next();
});

/**
 * ÍNDICES
 * Mejoran el rendimiento de búsquedas frecuentes
 */
returnSchema.index({ returnNumber: 1 }); // Búsqueda por número
returnSchema.index({ sale: 1 }); // Devoluciones de una venta
returnSchema.index({ status: 1 }); // Filtrar por estado
returnSchema.index({ createdAt: -1 }); // Ordenar por fecha

// Crear modelo a partir del esquema
const Return = mongoose.model('Return', returnSchema);

export default Return;
