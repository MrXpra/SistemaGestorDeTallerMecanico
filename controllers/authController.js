/**
 * AUTHCONTROLLER.JS - Controlador de Autenticación
 * 
 * Maneja las operaciones de autenticación:
 * - Login con email/password
 * - Obtener perfil del usuario actual
 * - Actualizar perfil del usuario actual
 * 
 * Todos los endpoints devuelven JSON y usan try/catch para manejo de errores.
 */

import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

/**
 * LOGIN - Autenticar usuario y obtener token JWT
 * 
 * @route   POST /api/auth/login
 * @access  Public (no requiere autenticación)
 * @body    { email: string, password: string }
 * @returns { _id, name, email, role, token }
 * 
 * Proceso:
 * 1. Validar que se envíen email y password
 * 2. Buscar usuario por email en BD
 * 3. Verificar que esté activo
 * 4. Comparar contraseña hasheada
 * 5. Generar token JWT
 * 6. Devolver datos del usuario + token
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica de campos requeridos
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor proporcione email y contraseña' });
    }

    // Buscar usuario por email
    // .select('+password') incluye el campo password que normalmente está excluido
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo (isActive = true)
    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuario inactivo. Contacte al administrador' });
    }

    // Comparar contraseña usando el método del modelo User
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT válido por 30 días
    const token = generateToken(user._id);

    // Devolver datos del usuario (sin password) y token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token // El frontend guardará esto en localStorage
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

/**
 * GETPROFILE - Obtener perfil del usuario autenticado
 * 
 * @route   GET /api/auth/profile
 * @access  Private (requiere middleware protect)
 * @returns Datos completos del usuario actual
 * 
 * req.user es inyectado por el middleware protect
 */
export const getProfile = async (req, res) => {
  try {
    // Buscar usuario usando el ID del token (req.user._id viene de protect)
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Devolver datos del perfil (sin password)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

/**
 * UPDATEPROFILE - Actualizar perfil del usuario autenticado
 * 
 * @route   PUT /api/auth/profile
 * @access  Private (requiere middleware protect)
 * @body    { name?, email?, password? } (todos opcionales)
 * @returns Datos actualizados + nuevo token
 * 
 * Permite actualizar nombre, email y/o contraseña.
 * Si se cambia la contraseña, el pre-save hook del modelo la hasheará.
 */
export const updateProfile = async (req, res) => {
  try {
    // Buscar usuario actual
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar solo los campos proporcionados
    user.name = req.body.name || user.name; // Si no se envía, mantener el actual
    user.email = req.body.email || user.email;

    // Si se proporciona nueva contraseña, actualizarla
    if (req.body.password) {
      user.password = req.body.password; // El pre-save hook la hasheará
    }

    // Guardar cambios (dispara pre-save hook)
    const updatedUser = await user.save();

    // Generar nuevo token (por si cambió el email)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id) // Nuevo token
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};
