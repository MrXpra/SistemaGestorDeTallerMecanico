import Settings from '../models/Settings.js';
import { verifySmtpConfig } from '../services/emailService.js';

// @desc    Obtener configuración del sistema
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    // Convertir a objeto y asegurar que smtp existe
    const settingsObj = settings.toObject();
    
    // Asegurar que smtp existe con estructura completa
    if (!settingsObj.smtp) {
      settingsObj.smtp = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        password: '',
        fromName: 'AutoParts Manager',
        fromEmail: ''
      };
    }
    
    // No enviar la contraseña SMTP en la respuesta (por seguridad)
    if (settingsObj.smtp.password) {
      settingsObj.smtp.password = ''; // Ocultar password
    }
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
  }
};

// @desc    Actualizar configuración del sistema
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getInstance();

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        // Para smtp, hacer merge de objetos en lugar de reemplazar
        if (key === 'smtp' && typeof req.body[key] === 'object') {
          if (!settings.smtp) {
            settings.smtp = {};
          }
          // Solo actualizar campos SMTP que no estén vacíos
          Object.keys(req.body[key]).forEach(smtpKey => {
            const value = req.body[key][smtpKey];
            // No sobrescribir password si viene vacío (es por seguridad del frontend)
            if (smtpKey === 'password' && value === '') {
              return;
            }
            settings.smtp[smtpKey] = value;
          });
        } else {
          settings[key] = req.body[key];
        }
      }
    });

    settings.updatedAt = Date.now();
    await settings.save();

    // No retornar password SMTP
    const settingsObj = settings.toObject();
    if (settingsObj.smtp && settingsObj.smtp.password) {
      settingsObj.smtp.password = '';
    }

    res.json(settingsObj);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
  }
};

// @desc    Actualizar configuración SMTP
// @route   PUT /api/settings/smtp
// @access  Private/Admin
export const updateSmtpSettings = async (req, res) => {
  try {
    const { host, port, secure, user, password, fromName, fromEmail } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada. Inicialice el sistema primero.'
      });
    }
    
    // Asegurar que smtp existe
    if (!settings.smtp) {
      settings.smtp = {};
    }
    
    // Actualizar solo campos SMTP proporcionados
    if (host !== undefined) settings.smtp.host = host;
    if (port !== undefined) settings.smtp.port = port;
    if (secure !== undefined) settings.smtp.secure = secure;
    if (user !== undefined) settings.smtp.user = user;
    if (password !== undefined && password !== '') settings.smtp.password = password;
    if (fromName !== undefined) settings.smtp.fromName = fromName;
    if (fromEmail !== undefined) settings.smtp.fromEmail = fromEmail;
    
    settings.updatedAt = Date.now();
    await settings.save();
    
    // No retornar la contraseña
    const settingsResponse = settings.toObject();
    if (settingsResponse.smtp && settingsResponse.smtp.password) {
      settingsResponse.smtp.password = '';
    }
    
    res.json({
      success: true,
      message: 'Configuración SMTP actualizada correctamente',
      data: settingsResponse
    });
    
  } catch (error) {
    console.error('Error al actualizar SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración SMTP',
      error: error.message
    });
  }
};

// @desc    Probar conexión SMTP
// @route   POST /api/settings/smtp/test
// @access  Private/Admin
export const testSmtpConnection = async (req, res) => {
  try {
    const result = await verifySmtpConfig();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('Error al probar SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error al probar conexión SMTP',
      error: error.message
    });
  }
};
