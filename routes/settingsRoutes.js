/**
 * @file settingsRoutes.js
 * @description Rutas para configuración global de la aplicación
 * 
 * Endpoints:
 * - GET /api/settings - Obtener configuración (PÚBLICO - sin token)
 * - PUT /api/settings - Actualizar configuración (solo admin)
 * 
 * Middleware:
 * - GET: SIN middleware (público) - frontend necesita config antes de login
 * - PUT: protect + admin - solo admin puede actualizar
 * 
 * Notas:
 * - Solo existe un documento de Settings (patrón Singleton)
 * - GET es público para cargar config inicial (nombre tienda, logo, etc.)
 * - Contiene: businessInfo, fiscalSettings, alerts, weatherIntegration, UI settings
 */

import express from 'express';
import { 
  getSettings, 
  updateSettings,
  updateSmtpSettings,
  testSmtpConnection
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow public GET for settings (frontend needs to load configuration without auth)
router.route('/')
  .get(getSettings)
  .put(protect, admin, updateSettings);

// Rutas para configuración SMTP (solo admin)
router.put('/smtp', protect, admin, updateSmtpSettings);
router.post('/smtp/test', protect, admin, testSmtpConnection);

export default router;
