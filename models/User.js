/**
 * USER.JS - Modelo de Usuario
 * 
 * Define el esquema y comportamiento de los usuarios del sistema.
 * Incluye autenticación con contraseñas hasheadas y roles.
 * 
 * Roles disponibles:
 * - admin: Acceso completo al sistema
 * - cajero: Acceso limitado a ventas y productos
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Para hashear contraseñas de forma segura

/**
 * ESQUEMA DE USUARIO
 * Define la estructura de los documentos de usuario en MongoDB
 */
const userSchema = new mongoose.Schema({
  // Nombre completo del usuario
  name: {
    type: String,
    required: [true, 'El nombre es requerido'], // Campo obligatorio con mensaje personalizado
    trim: true // Elimina espacios al inicio y final
  },
  
  // Email único para login
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true, // Crea índice único en MongoDB
    lowercase: true, // Convierte a minúsculas automáticamente
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido'] // Validación con regex
  },
  
  // Contraseña hasheada (nunca se guarda en texto plano)
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 6, // Mínimo 6 caracteres
    select: false // NO se incluye en queries por defecto (seguridad)
  },
  
  // Rol del usuario (determina permisos)
  role: {
    type: String,
    enum: ['admin', 'cajero'], // Solo puede ser uno de estos valores
    default: 'cajero' // Por defecto, los usuarios son cajeros
  },
  
  // Estado del usuario (permite desactivar sin eliminar)
  isActive: {
    type: Boolean,
    default: true // Usuarios activos por defecto
  },
  
  // Fecha de creación (se establece automáticamente)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * MIDDLEWARE PRE-SAVE
 * Se ejecuta ANTES de guardar un usuario en la BD
 * Hashea la contraseña si fue modificada
 */
userSchema.pre('save', async function(next) {
  // Si la contraseña no fue modificada, continuar sin hashear
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generar "salt" (datos aleatorios para mayor seguridad)
  const salt = await bcrypt.genSalt(10);
  
  // Hashear la contraseña con el salt
  this.password = await bcrypt.hash(this.password, salt);
  
  next(); // Continuar con el guardado
});

/**
 * MÉTODO DE INSTANCIA: comparePassword
 * Compara una contraseña en texto plano con la hasheada en la BD
 * 
 * @param {string} candidatePassword - Contraseña ingresada por el usuario
 * @returns {Promise<boolean>} - true si coinciden, false si no
 * 
 * Uso: const isMatch = await user.comparePassword('password123');
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Crear el modelo a partir del esquema
const User = mongoose.model('User', userSchema);

export default User;
