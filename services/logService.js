import Log from '../models/Log.js';
import os from 'os';

/**
 * Servicio centralizado para crear logs del sistema con capacidades avanzadas
 * de auditoría, rendimiento y monitoreo
 */
class LogService {
  
  // Umbrales de rendimiento (en ms)
  static PERFORMANCE_THRESHOLDS = {
    database: 100,    // Queries DB lentas
    api: 1000,        // Peticiones API lentas
    operation: 500    // Operaciones generales lentas
  };
  
  /**
   * Obtener información del sistema actual
   */
  static getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: os.platform(),
      hostname: os.hostname(),
      processId: process.pid,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        model: os.cpus()[0]?.model,
        cores: os.cpus().length,
        loadAvg: os.loadavg()
      }
    };
  }
  
  /**
   * Calcular diferencias detalladas entre objetos para auditoría
   */
  static getDetailedChanges(before, after) {
    const changes = {
      fields: [],
      details: [],
      summary: ''
    };
    
    if (!before || !after) return changes;
    
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    
    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes.fields.push(key);
        changes.details.push({
          field: key,
          oldValue: before[key],
          newValue: after[key],
          type: typeof after[key]
        });
      }
    }
    
    if (changes.fields.length > 0) {
      changes.summary = `Modificados ${changes.fields.length} campos: ${changes.fields.join(', ')}`;
    }
    
    return changes;
  }
  
  /**
   * Crear un log genérico con información extendida
   */
  static async createLog({
    type = 'info',
    severity = 'low',
    category = 'user_action',
    module,
    action,
    message,
    user = null,
    entityId = null,
    entityName = null,
    isSystemAction = false,
    details = {},
    request = {},
    error = null,
    changes = null,
    metadata = {},
    audit = {},
    performance = {},
    tags = []
  }) {
    try {
      const systemInfo = this.getSystemInfo();
      
      const logData = {
        type,
        severity,
        category,
        module,
        action,
        message,
        user: user?._id || user,
        entityId,
        entityName,
        isSystemAction,
        details,
        request,
        timestamp: new Date()
      };

      // Agregar detalles del usuario si existe
      if (user) {
        logData.userDetails = {
          username: user.username,
          name: user.name,
          role: user.role
        };
      }

      // Agregar información del error si existe (extendida)
      if (error) {
        logData.error = {
          message: error.message || String(error),
          stack: error.stack,
          code: error.code || error.statusCode,
          type: error.constructor?.name || 'Error',
          isOperational: error.isOperational || false,
          context: error.context || {},
          handled: true
        };
        
        // Auto-clasificar severidad basado en el error
        if (!severity || severity === 'low') {
          logData.severity = error.isOperational ? 'medium' : 'high';
        }
      }

      // Agregar cambios detallados si existen
      if (changes) {
        const detailedChanges = this.getDetailedChanges(changes.before, changes.after);
        logData.changes = {
          before: changes.before,
          after: changes.after,
          fields: detailedChanges.fields,
          summary: detailedChanges.summary
        };
      }
      
      // Agregar información de auditoría
      if (audit || Object.keys(audit).length > 0) {
        logData.audit = {
          operation: audit.operation,
          resource: audit.resource,
          resourceId: audit.resourceId,
          affectedRecords: audit.affectedRecords || 1,
          source: audit.source || 'web',
          sessionId: audit.sessionId,
          correlationId: audit.correlationId
        };
      }
      
      // Agregar métricas de rendimiento
      if (performance && Object.keys(performance).length > 0) {
        const executionTime = performance.executionTime || performance.duration;
        logData.performance = {
          executionTime,
          dbQueryTime: performance.dbQueryTime,
          memoryUsage: performance.memoryUsage || (systemInfo.memory.used / 1024 / 1024), // MB
          cpuUsage: performance.cpuUsage,
          queryCount: performance.queryCount || 0,
          startTime: performance.startTime,
          endTime: performance.endTime,
          cacheHit: performance.cacheHit || false,
          slowOperation: executionTime > this.PERFORMANCE_THRESHOLDS.operation
        };
      }
      
      // Metadata extendida con información del sistema
      logData.metadata = {
        ...metadata,
        systemInfo: {
          nodeVersion: systemInfo.nodeVersion,
          platform: systemInfo.platform,
          hostname: systemInfo.hostname,
          processId: systemInfo.processId,
          uptime: Math.floor(systemInfo.uptime)
        },
        tags: tags || [],
        priority: metadata.priority || this.determinePriority(type, severity),
        notified: false,
        resolved: false
      };

      const log = new Log(logData);
      await log.save();
      
      // Si es crítico, podríamos enviar notificación (implementar después)
      if (severity === 'critical' || logData.metadata.priority === 'urgent') {
        this.handleCriticalLog(log);
      }
      
      return log;
    } catch (err) {
      // No fallar si el logging falla, solo registrar en consola
      console.error('❌ Error al crear log:', err.message);
      console.error(err.stack);
      return null;
    }
  }
  
  /**
   * Determinar prioridad automáticamente
   */
  static determinePriority(type, severity) {
    if (severity === 'critical' || type === 'error') return 'urgent';
    if (severity === 'high') return 'high';
    if (severity === 'medium' || type === 'warning') return 'normal';
    return 'low';
  }
  
  /**
   * Manejar logs críticos (notificaciones, alertas, etc.)
   */
  static async handleCriticalLog(log) {
    // Aquí se puede implementar:
    // - Envío de emails a administradores
    // - Notificaciones push
    // - Webhooks a servicios externos
    // - Alertas en dashboard en tiempo real
    console.warn('🚨 LOG CRÍTICO:', log.message);
  }

  /**
   * Log de autenticación
   */
  static async logAuth(action, user, req, success = true, details = {}) {
    return await this.createLog({
      type: 'auth',
      severity: success ? 'low' : 'high',
      module: 'auth',
      action,
      message: `${action} ${success ? 'exitoso' : 'fallido'}: ${user?.name || user?.username || 'usuario desconocido'}`,
      user: success ? user : null,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
      },
      details,
      metadata: { success }
    });
  }

  /**
   * Log de acción CRUD con auditoría completa
   */
  static async logAction({
    action,
    module,
    user,
    req,
    entityId,
    entityName,
    details = {},
    changes = null,
    success = true,
    performance = {}
  }) {
    const actionMessages = {
      create: 'creado',
      update: 'actualizado',
      delete: 'eliminado',
      archive: 'archivado',
      cancel: 'cancelado',
      restore: 'restaurado',
      read: 'consultado',
      export: 'exportado'
    };
    
    const operationMap = {
      create: 'CREATE',
      update: 'UPDATE',
      delete: 'DELETE',
      archive: 'DELETE',
      read: 'READ'
    };

    // Determinar si es una acción del sistema (lecturas, exports, consultas)
    const systemActions = ['read', 'export', 'list', 'fetch', 'get', 'search'];
    const isSystemAction = systemActions.includes(action.toLowerCase());
    
    return await this.createLog({
      type: success ? 'action' : 'error',
      category: 'data_modification',
      severity: action === 'delete' ? 'medium' : 'low',
      module,
      action,
      message: `${module} ${actionMessages[action] || action}: ${entityName || entityId}`,
      user,
      entityId,
      entityName,
      isSystemAction,
      request: req ? {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
      } : {},
      details,
      changes,
      audit: {
        operation: operationMap[action] || action.toUpperCase(),
        resource: module,
        resourceId: entityId,
        source: 'web',
        sessionId: req?.sessionID,
        correlationId: req?.headers?.['x-correlation-id']
      },
      performance,
      metadata: { success },
      tags: [module, action, success ? 'success' : 'failed', isSystemAction ? 'system' : 'user']
    });
  }
  
  /**
   * Log de auditoría detallada (para operaciones críticas)
   */
  static async logAudit({
    module,
    action,
    user,
    req,
    resource,
    resourceId,
    before,
    after,
    reason = '',
    affectedRecords = 1
  }) {
    const detailedChanges = this.getDetailedChanges(before, after);
    
    return await this.createLog({
      type: 'audit',
      category: 'data_modification',
      severity: 'medium',
      module,
      action,
      message: `Auditoría: ${action} en ${resource} - ${detailedChanges.summary || reason}`,
      user,
      entityId: resourceId,
      entityName: resource,
      request: req ? {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
      } : {},
      changes: {
        before,
        after,
        fields: detailedChanges.fields,
        summary: detailedChanges.summary
      },
      audit: {
        operation: action.toUpperCase(),
        resource,
        resourceId,
        affectedRecords,
        source: 'web'
      },
      details: {
        reason,
        changeDetails: detailedChanges.details
      },
      tags: ['audit', module, action]
    });
  }
  
  /**
   * Log de rendimiento (para monitoreo)
   */
  static async logPerformance({
    module,
    action,
    operation,
    executionTime,
    dbQueryTime = 0,
    queryCount = 0,
    memoryUsage = 0,
    details = {},
    user = null,
    req = null
  }) {
    const isSlowOperation = executionTime > this.PERFORMANCE_THRESHOLDS.operation;
    const isSlowDB = dbQueryTime > this.PERFORMANCE_THRESHOLDS.database;
    
    return await this.createLog({
      type: 'performance',
      category: 'performance_metric',
      severity: isSlowOperation || isSlowDB ? 'medium' : 'low',
      module,
      action: action || 'performance_metric',
      message: `${operation}: ${executionTime}ms ${isSlowOperation ? '⚠️ LENTO' : '✓'}`,
      user,
      request: req ? {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress
      } : {},
      performance: {
        executionTime,
        dbQueryTime,
        queryCount,
        memoryUsage,
        slowOperation: isSlowOperation,
        endTime: new Date()
      },
      details,
      tags: ['performance', module, isSlowOperation ? 'slow' : 'fast'],
      metadata: {
        priority: isSlowOperation ? 'high' : 'normal'
      }
    });
  }

  /**
   * Log de error
   */
  static async logError({
    module,
    action,
    message,
    error,
    user = null,
    req = null,
    details = {}
  }) {
    return await this.createLog({
      type: 'error',
      severity: 'high',
      module,
      action,
      message,
      user,
      error,
      request: req ? {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
      } : {},
      details,
      metadata: { success: false }
    });
  }

  /**
   * Log de advertencia
   */
  static async logWarning({
    module,
    action,
    message,
    user = null,
    details = {}
  }) {
    return await this.createLog({
      type: 'warning',
      severity: 'medium',
      module,
      action,
      message,
      user,
      details
    });
  }

  /**
   * Log de información
   */
  static async logInfo({
    module,
    action,
    message,
    user = null,
    details = {}
  }) {
    return await this.createLog({
      type: 'info',
      severity: 'low',
      module,
      action,
      message,
      user,
      details
    });
  }

  /**
   * Obtener logs con filtros
   */
  static async getLogs({
    type,
    module,
    user,
    startDate,
    endDate,
    severity,
    isSystemAction,
    limit = 100,
    skip = 0
  } = {}) {
    try {
      const query = {};

      if (type) query.type = type;
      if (module) query.module = module;
      if (user) query.user = user;
      if (severity) query.severity = severity;
      if (isSystemAction !== undefined) {
        query.isSystemAction = isSystemAction === 'true' || isSystemAction === true;
      }
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const logs = await Log.find(query)
        .populate('user', 'username name role')
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Log.countDocuments(query);

      return { logs, total };
    } catch (error) {
      console.error('Error al obtener logs:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de logs (mejorado)
   */
  static async getStats(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDate = new Date();

      return await Log.getStats(startDate, endDate);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener métricas de rendimiento del sistema
   */
  static async getPerformanceMetrics(hours = 24) {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);
      
      const metrics = await Log.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            'performance.executionTime': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              module: '$module',
              hour: { $hour: '$timestamp' }
            },
            avgExecutionTime: { $avg: '$performance.executionTime' },
            maxExecutionTime: { $max: '$performance.executionTime' },
            minExecutionTime: { $min: '$performance.executionTime' },
            avgDbTime: { $avg: '$performance.dbQueryTime' },
            avgQueryCount: { $avg: '$performance.queryCount' },
            slowOperations: {
              $sum: { $cond: ['$performance.slowOperation', 1, 0] }
            },
            totalOperations: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.hour': -1 }
        }
      ]);
      
      return metrics;
    } catch (error) {
      console.error('Error al obtener métricas de rendimiento:', error);
      throw error;
    }
  }
  
  /**
   * Obtener logs de errores recientes
   */
  static async getRecentErrors(limit = 50) {
    try {
      return await Log.find({ 
        type: 'error',
        'metadata.resolved': { $ne: true }
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('user', 'username fullName')
        .lean();
    } catch (error) {
      console.error('Error al obtener errores recientes:', error);
      throw error;
    }
  }
  
  /**
   * Obtener alertas críticas sin resolver
   */
  static async getCriticalAlerts() {
    try {
      return await Log.find({
        severity: 'critical',
        'metadata.resolved': { $ne: true },
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .sort({ timestamp: -1 })
        .populate('user', 'username fullName')
        .lean();
    } catch (error) {
      console.error('Error al obtener alertas críticas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener resumen de auditoría (quién hizo qué)
   */
  static async getAuditSummary(startDate, endDate, userId = null) {
    try {
      const match = {
        type: { $in: ['action', 'audit'] },
        timestamp: { $gte: startDate, $lte: endDate }
      };
      
      if (userId) {
        match.user = userId;
      }
      
      const summary = await Log.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              user: '$user',
              module: '$module',
              action: '$action'
            },
            count: { $sum: 1 },
            lastAction: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id.user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      return summary;
    } catch (error) {
      console.error('Error al obtener resumen de auditoría:', error);
      throw error;
    }
  }
  
  /**
   * Marcar log como resuelto
   */
  static async resolveLog(logId, resolvedBy, resolution) {
    try {
      return await Log.findByIdAndUpdate(
        logId,
        {
          'metadata.resolved': true,
          'metadata.resolvedBy': resolvedBy,
          'metadata.resolvedAt': new Date(),
          'metadata.resolution': resolution
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error al resolver log:', error);
      throw error;
    }
  }

  /**
   * Limpiar logs antiguos
   */
  static async cleanOldLogs(daysToKeep = 90) {
    try {
      return await Log.cleanOldLogs(daysToKeep);
    } catch (error) {
      console.error('Error al limpiar logs:', error);
      throw error;
    }
  }
}

export default LogService;
