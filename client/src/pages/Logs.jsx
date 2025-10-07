﻿import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  Activity,
  XCircle,
  AlertCircle,
  Box,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  User,
  Download,
  Trash2
} from "lucide-react";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [hoveredLog, setHoveredLog] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [pagination, setPagination] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const [filters, setFilters] = useState({
    type: "",
    module: "",
    severity: "",
    isSystemAction: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 50
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/logs?${params.toString()}`);
      setLogs(response.data.logs || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error al cargar logs:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error al cargar logs";
      toast.error(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/logs/stats?days=7");
      setStats(response.data || []);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setStats([]);
    }
  };

  const cleanOldLogs = async () => {
    if (!confirm("¿Está seguro que desea eliminar los logs antiguos (mayores a 90 días)?")) {
      return;
    }

    try {
      const response = await api.delete("/logs/clean", {
        data: { daysToKeep: 90 }
      });
      toast.success(response.data.message);
      loadLogs();
      loadStats();
    } catch (error) {
      console.error("Error al limpiar logs:", error);
      toast.error("Error al limpiar logs");
    }
  };

  const exportLogs = () => {
    const headers = ["Fecha", "Tipo", "Módulo", "Acción", "Usuario", "Mensaje"];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString("es-DO"),
      log.type,
      log.module,
      log.action,
      log.userDetails?.name || log.userDetails?.username || "Sistema",
      log.message
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getTypeIcon = (type) => {
    const icons = {
      error: <XCircle className="w-5 h-5 text-red-500" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
      auth: <User className="w-5 h-5 text-purple-500" />,
      action: <Activity className="w-5 h-5 text-indigo-500" />
    };
    return icons[type] || <AlertCircle className="w-5 h-5 text-gray-500" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      error: "Error",
      warning: "Advertencia",
      success: "Éxito",
      info: "Información",
      auth: "Autenticación",
      action: "Acción"
    };
    return labels[type] || type;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[severity] || badges.medium}`}>
        {severity}
      </span>
    );
  };

  const handleIconHover = (log, event) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height + 5
      });
      setHoveredLog(log);
    }, 300);
  };

  const handleIconLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredLog(null);
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      module: "",
      severity: "",
      isSystemAction: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 50
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-8 h-8 text-indigo-600" />
            Sistema de Logs
          </h1>
          <p className="text-gray-600 mt-1">Auditoría y seguimiento de actividades del sistema</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={cleanOldLogs}
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Antiguos
          </button>
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs (7d)</p>
                <p className="text-2xl font-bold">
                  {stats.reduce((sum, s) => sum + s.count, 0)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errores</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.reduce((sum, s) => sum + s.errors, 0)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Módulos Activos</p>
                <p className="text-2xl font-bold">
                  {new Set(stats.map(s => s._id.module)).size}
                </p>
              </div>
              <Box className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {(stats.reduce((sum, s) => sum + (s.avgDuration || 0), 0) / stats.length).toFixed(0)}ms
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      <div className="card-glass p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Filtros</h2>
          <button
            onClick={resetFilters}
            className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todos los tipos</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="auth">Auth</option>
            <option value="action">Action</option>
          </select>

          <select
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todos los módulos</option>
            <option value="auth">Auth</option>
            <option value="products">Products</option>
            <option value="sales">Sales</option>
            <option value="returns">Returns</option>
            <option value="customers">Customers</option>
            <option value="suppliers">Suppliers</option>
            <option value="users">Users</option>
            <option value="system">System</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todas las severidades</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.isSystemAction}
            onChange={(e) => setFilters({ ...filters, isSystemAction: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todos los orígenes</option>
            <option value="false">👤 Acciones de Usuario</option>
            <option value="true">⚙️ Acciones del Sistema</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            className="form-input"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            className="form-input"
          />

          <select
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="25">25 logs</option>
            <option value="50">50 logs</option>
            <option value="100">100 logs</option>
            <option value="200">200 logs</option>
          </select>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron logs con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div
                          className="relative inline-block cursor-help"
                          onMouseEnter={(e) => handleIconHover(log, e)}
                          onMouseLeave={handleIconLeave}
                          title={getTypeLabel(log.type)}
                        >
                          {getTypeIcon(log.type)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString("es-DO")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{log.module}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              log.isSystemAction
                                ? "bg-gray-100 text-gray-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                            title={log.isSystemAction ? "Acción del Sistema" : "Acción de Usuario"}
                          >
                            {log.isSystemAction ? "⚙️" : "👤"}
                          </span>
                          <span className="text-sm text-gray-900">
                            {log.userDetails?.name || log.userDetails?.username || "Sistema"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                        {log.message}
                      </td>
                      <td className="px-4 py-3">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-700">
                  Página {pagination.page} de {pagination.pages} ({pagination.total} logs)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {hoveredLog && createPortal(
        <div
          className="fixed z-[100001] pointer-events-none"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            transform: "translateX(-50%)"
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getTypeIcon(hoveredLog.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-gray-900">{getTypeLabel(hoveredLog.type)}</h3>
                  {getSeverityBadge(hoveredLog.severity)}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-600">
                    <span className="font-medium">Módulo:</span> {hoveredLog.module}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Acción:</span> {hoveredLog.action}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Usuario:</span> {hoveredLog.userDetails?.name || hoveredLog.userDetails?.username || "Sistema"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Fecha:</span> {new Date(hoveredLog.timestamp).toLocaleString("es-DO")}
                  </p>
                  <p className="text-gray-700 mt-2 break-words">
                    <span className="font-medium">Mensaje:</span> {hoveredLog.message}
                  </p>
                  {hoveredLog.request?.ip && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">IP:</span> {hoveredLog.request.ip}
                    </p>
                  )}
                </div>
                <p className="text-xs text-indigo-600 mt-2 italic font-medium">💡 Click en el ícono de ojo para ver todos los detalles</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedLog && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Detalles del Log</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedLog.type)}
                    <span className="font-medium">{getTypeLabel(selectedLog.type)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Severidad</label>
                  <div className="mt-1">
                    {getSeverityBadge(selectedLog.severity)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Módulo</label>
                  <p className="mt-1 font-medium">{selectedLog.module}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Acción</label>
                  <p className="mt-1 font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha/Hora</label>
                  <p className="mt-1">{new Date(selectedLog.timestamp).toLocaleString("es-DO")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Usuario</label>
                  <p className="mt-1">{selectedLog.userDetails?.name || selectedLog.userDetails?.username || "Sistema"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Mensaje</label>
                <p className="mt-1 bg-gray-50 p-3 rounded">{selectedLog.message}</p>
              </div>

              {selectedLog.request && Object.keys(selectedLog.request).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Información de la Petición</label>
                  <pre className="mt-1 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.request, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Detalles</label>
                  <pre className="mt-1 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Cambios Realizados</label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Antes</p>
                      <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Después</p>
                      <pre className="bg-green-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <label className="text-sm font-medium text-red-600">Error</label>
                  <div className="mt-1 bg-red-50 p-3 rounded">
                    <p className="text-sm font-medium text-red-800">{selectedLog.error.message}</p>
                    {selectedLog.error.stack && (
                      <pre className="mt-2 text-xs text-red-700 overflow-x-auto">
                        {selectedLog.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadata</label>
                  <div className="mt-1 grid grid-cols-3 gap-4">
                    {selectedLog.metadata.duration && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Duración</p>
                        <p className="font-medium">{selectedLog.metadata.duration}ms</p>
                      </div>
                    )}
                    {selectedLog.metadata.statusCode && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Código HTTP</p>
                        <p className="font-medium">{selectedLog.metadata.statusCode}</p>
                      </div>
                    )}
                    {selectedLog.metadata.success !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Estado</p>
                        <p className="font-medium">
                          {selectedLog.metadata.success ? "✅ Exitoso" : "❌ Fallido"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Logs;
