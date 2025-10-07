import LogService from '../services/logService.js';

/**
 * Middleware para registrar todas las peticiones HTTP
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Guardar el método original de res.json para interceptarlo
  const originalJson = res.json;

  res.json = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Solo registrar peticiones a /api (no assets ni otras rutas)
    if (req.originalUrl.startsWith('/api')) {
      // Determinar el módulo desde la URL (eliminar query params)
      const urlWithoutQuery = req.originalUrl.split('?')[0];
      const urlParts = urlWithoutQuery.split('/');
      let module = urlParts[2] || 'system'; // /api/products -> products
      
      // Normalizar nombres de módulos compuestos
      if (module === 'purchase-orders') module = 'purchaseOrders';
      if (module === 'cash-withdrawals') module = 'cashWithdrawals';
      
      // Validar que el módulo está en la lista permitida
      const validModules = [
        'auth', 'users', 'products', 'sales', 'returns', 'customers',
        'suppliers', 'inventory', 'purchaseOrders', 'cashRegister',
        'cashWithdrawals', 'settings', 'system', 'dashboard', 'logs', 'proxy'
      ];
      
      if (!validModules.includes(module)) {
        module = 'system';
      }

      // Determinar el tipo de log basado en el código de estado
      let type = 'info';
      let severity = 'low';
      
      if (statusCode >= 500) {
        type = 'error';
        severity = 'critical';
      } else if (statusCode >= 400) {
        type = 'warning';
        severity = 'medium';
      } else if (statusCode >= 200 && statusCode < 300) {
        type = 'success';
        severity = 'low';
      }

      // Crear log asíncrono (no bloquear respuesta)
      setImmediate(() => {
        LogService.createLog({
          type,
          severity,
          module,
          action: req.method.toLowerCase(),
          message: `${req.method} ${req.originalUrl} - ${statusCode}`,
          user: req.user || null,
          request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('user-agent')
          },
          details: {
            query: req.query,
            body: sanitizeBody(req.body),
            params: req.params
          },
          metadata: {
            duration,
            success: statusCode >= 200 && statusCode < 400,
            statusCode
          }
        }).catch(err => {
          console.error('Error en requestLogger:', err.message);
        });
      });
    }

    // Llamar al método original
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Sanitizar body para no guardar contraseñas u otra información sensible
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Middleware para capturar errores no controlados
 */
export const errorLogger = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Determinar el módulo desde la URL
  const urlParts = req.originalUrl.split('/');
  const module = urlParts[2] || 'system';

  // Crear log de error
  LogService.logError({
    module,
    action: req.method.toLowerCase(),
    message: `Error en ${req.method} ${req.originalUrl}: ${err.message}`,
    error: err,
    user: req.user || null,
    req,
    details: {
      query: req.query,
      body: sanitizeBody(req.body),
      params: req.params
    }
  }).catch(logErr => {
    console.error('Error al crear log de error:', logErr.message);
  });

  // Pasar el error al siguiente middleware
  next(err);
};
