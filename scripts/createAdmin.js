/**
 * CREATE ADMIN - Script para crear únicamente el usuario administrador
 * 
 * Este script limpia la base de datos y crea un usuario admin básico
 * Uso: npm run create-admin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import connectDB from '../config/db.js';

// Cargar variables de entorno
dotenv.config();

const createAdmin = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    console.log('🗑️  Limpiando base de datos...');
    
    // Eliminar todas las colecciones existentes
    await User.deleteMany({});
    await Settings.deleteMany({});
    
    console.log('✅ Base de datos limpiada');
    
    // Crear usuario administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Usuario administrador creado');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Email: admin@admin.com');
    console.log('🔑 Contraseña: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    console.log('');
    
    // Crear configuración inicial básica
    await Settings.create({
      businessName: 'Mi Negocio',
      businessAddress: '',
      businessPhone: '',
      taxId: '',
      currency: 'USD',
      taxRate: 0,
      receiptFooter: 'Gracias por su compra',
      lowStockThreshold: 10
    });
    
    console.log('✅ Configuración inicial creada');
    console.log('🎉 Sistema listo para usar');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
