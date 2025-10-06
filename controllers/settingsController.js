import Settings from '../models/Settings.js';

// @desc    Obtener configuración del sistema
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    res.json(settings);
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
        settings[key] = req.body[key];
      }
    });

    settings.updatedAt = Date.now();
    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
  }
};
