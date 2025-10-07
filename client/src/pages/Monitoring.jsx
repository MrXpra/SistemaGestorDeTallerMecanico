import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Zap,
  RefreshCw,
  Eye,
  CheckSquare
} from 'lucide-react';

const Monitoring = () => {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [recentErrors, setRecentErrors] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    loadAllMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAllMetrics();
      }, 30000); // Refresh cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAllMetrics = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSystemMetrics(),
        loadPerformanceMetrics(),
        loadRecentErrors(),
        loadCriticalAlerts()
      ]);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await api.get('/logs/monitoring/system');
      setSystemMetrics(response.data);
    } catch (error) {
      console.error('Error al cargar métricas del sistema:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const response = await api.get('/logs/performance?hours=24');
      setPerformanceMetrics(response.data);
    } catch (error) {
      console.error('Error al cargar métricas de rendimiento:', error);
    }
  };

  const loadRecentErrors = async () => {
    try {
      const response = await api.get('/logs/errors?limit=10');
      setRecentErrors(response.data);
    } catch (error) {
      console.error('Error al cargar errores recientes:', error);
    }
  };

  const loadCriticalAlerts = async () => {
    try {
      const response = await api.get('/logs/alerts');
      setCriticalAlerts(response.data);
    } catch (error) {
      console.error('Error al cargar alertas críticas:', error);
    }
  };

  const resolveError = async (logId, resolution) => {
    try {
      await api.patch(`/logs/${logId}/resolve`, { resolution });
      toast.success('Error marcado como resuelto');
      loadRecentErrors();
      loadCriticalAlerts();
      setSelectedError(null);
    } catch (error) {
      toast.error('Error al resolver log');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-8 h-8 text-indigo-600" />
            Monitoreo del Sistema
          </h1>
          <p className="text-gray-600 mt-1">Métricas en tiempo real y análisis de rendimiento</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn-secondary flex items-center gap-2 ${autoRefresh ? 'bg-green-100 text-green-700' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={loadAllMetrics}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Alertas Críticas */}
      {criticalAlerts.length > 0 && (
        <div className="card-glass border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-600">
              {criticalAlerts.length} Alerta{criticalAlerts.length > 1 ? 's' : ''} Crítica{criticalAlerts.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <div key={alert._id} className="flex items-center justify-between bg-red-50 p-3 rounded">
                <div className="flex-1">
                  <p className="font-medium text-red-800">{alert.message}</p>
                  <p className="text-sm text-red-600">
                    {new Date(alert.timestamp).toLocaleString('es-DO')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedError(alert)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas del Sistema en Tiempo Real */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CPU */}
          <div className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">CPU</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {systemMetrics.cpu.cores} cores
            </p>
            <p className="text-xs text-gray-500 mt-1">{systemMetrics.cpu.model}</p>
            <div className="mt-2">
              <p className="text-xs text-gray-600">Load Avg</p>
              <div className="flex gap-2 mt-1">
                {systemMetrics.loadAverage.map((load, i) => (
                  <span key={i} className="text-xs font-mono bg-blue-100 px-2 py-1 rounded">
                    {load.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Memoria */}
          <div className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Memoria</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {systemMetrics.memoryUsagePercent}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  parseFloat(systemMetrics.memoryUsagePercent) > 80 ? 'bg-red-500' :
                  parseFloat(systemMetrics.memoryUsagePercent) > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${systemMetrics.memoryUsagePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Uptime */}
          <div className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Uptime</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatUptime(systemMetrics.uptime)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {systemMetrics.platform} - Node {systemMetrics.nodeVersion}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Proceso: {systemMetrics.processId}
            </p>
          </div>

          {/* Estado General */}
          <div className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-600">Estado</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">Operativo</p>
            <p className="text-xs text-gray-500 mt-1">
              Errores: {recentErrors.length}
            </p>
            <p className="text-xs text-gray-500">
              Alertas: {criticalAlerts.length}
            </p>
          </div>
        </div>
      )}

      {/* Métricas de Rendimiento */}
      <div className="card-glass p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Rendimiento (Últimas 24h)</h2>
        </div>

        {performanceMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operaciones</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Promedio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Máx</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DB Promedio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lentas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {performanceMetrics.slice(0, 10).map((metric, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{metric._id.module}</td>
                    <td className="px-4 py-3 text-gray-600">{metric.totalOperations}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono ${
                        metric.avgExecutionTime > 1000 ? 'text-red-600 font-bold' :
                        metric.avgExecutionTime > 500 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {metric.avgExecutionTime.toFixed(0)}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600">
                        {metric.maxExecutionTime.toFixed(0)}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600">
                        {(metric.avgDbTime || 0).toFixed(0)}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {metric.slowOperations > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {metric.slowOperations}
                        </span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No hay datos de rendimiento disponibles</p>
        )}
      </div>

      {/* Errores Recientes */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Errores Recientes</h2>
        </div>

        {recentErrors.length > 0 ? (
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <div key={error._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        {error.module}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(error.timestamp).toLocaleString('es-DO')}
                      </span>
                    </div>
                    <p className="font-medium text-red-900">{error.message}</p>
                    {error.error?.message && (
                      <p className="text-sm text-red-700 mt-1">{error.error.message}</p>
                    )}
                    {error.user && (
                      <p className="text-xs text-gray-600 mt-2">
                        Usuario: {error.userDetails?.fullName || error.userDetails?.username}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedError(error)}
                      className="text-red-600 hover:text-red-800"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!error.metadata?.resolved && (
                      <button
                        onClick={() => {
                          const resolution = prompt('Describe la resolución del error:');
                          if (resolution) resolveError(error._id, resolution);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Marcar como resuelto"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No hay errores recientes sin resolver</p>
          </div>
        )}
      </div>

      {/* Modal de Detalles de Error */}
      {selectedError && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Detalles del Error</h2>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Mensaje</label>
                <p className="mt-1 bg-red-50 p-3 rounded text-red-900 font-medium">{selectedError.message}</p>
              </div>

              {selectedError.error && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Error Detallado</label>
                  <div className="mt-1 bg-gray-50 p-3 rounded">
                    <p className="font-medium text-red-800">{selectedError.error.message}</p>
                    {selectedError.error.stack && (
                      <pre className="mt-2 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                        {selectedError.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Módulo</label>
                  <p className="mt-1 font-medium">{selectedError.module}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Severidad</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedError.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedError.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedError.severity}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha/Hora</label>
                  <p className="mt-1">{new Date(selectedError.timestamp).toLocaleString('es-DO')}</p>
                </div>
                {selectedError.user && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Usuario</label>
                    <p className="mt-1">{selectedError.userDetails?.fullName || selectedError.userDetails?.username}</p>
                  </div>
                )}
              </div>

              {selectedError.request && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Info</label>
                  <pre className="mt-1 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedError.request, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                {!selectedError.metadata?.resolved && (
                  <button
                    onClick={() => {
                      const resolution = prompt('Describe la resolución del error:');
                      if (resolution) resolveError(selectedError._id, resolution);
                    }}
                    className="btn-primary"
                  >
                    Marcar como Resuelto
                  </button>
                )}
                <button
                  onClick={() => setSelectedError(null)}
                  className="btn-secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Monitoring;
