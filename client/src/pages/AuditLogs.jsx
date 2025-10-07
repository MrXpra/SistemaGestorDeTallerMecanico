import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  Shield,
  User,
  Download,
  Trash2,
  Eye,
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    module: "",
    action: "",
    severity: "",
    entityType: "",
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

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(response.data.logs || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error al cargar logs de auditoría:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error al cargar logs";
      toast.error(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/audit-logs/stats?days=7");
      setStats(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setStats(null);
    }
  };

  const cleanOldLogs = async () => {
    if (!confirm("¿Está seguro que desea eliminar los logs de auditoría antiguos (mayores a 365 días)?")) {
      return;
    }

    try {
      const response = await api.delete("/audit-logs/clean", {
        data: { daysToKeep: 365 }
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
    const headers = ["Fecha", "Usuario", "Módulo", "Acción", "Entidad", "Descripción"];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString("es-DO"),
      log.userInfo?.name || "Desconocido",
      log.module,
      log.action,
      `${log.entity.type} - ${log.entity.name}`,
      log.description
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      info: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-3 h-3" /> },
      warning: { color: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> },
      critical: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> }
    };

    const badge = badges[severity] || badges.info;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {severity}
      </span>
    );
  };

  const getModuleBadge = (module) => {
    const colors = {
      ventas: "bg-green-100 text-green-800",
      inventario: "bg-purple-100 text-purple-800",
      clientes: "bg-blue-100 text-blue-800",
      proveedores: "bg-indigo-100 text-indigo-800",
      usuarios: "bg-orange-100 text-orange-800",
      caja: "bg-yellow-100 text-yellow-800",
      devoluciones: "bg-red-100 text-red-800",
      ordenes_compra: "bg-cyan-100 text-cyan-800",
      configuracion: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[module] || "bg-gray-100 text-gray-800"}`}>
        {module.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const resetFilters = () => {
    setFilters({
      module: "",
      action: "",
      severity: "",
      entityType: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 50
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            Auditoría de Acciones de Usuario
          </h1>
          <p className="text-gray-600 mt-1">Registro de eventos de negocio significativos</p>
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

      {/* Estadísticas */}
      {stats && stats.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Acciones (7d)</p>
                <p className="text-2xl font-bold">{stats.summary.total}</p>
              </div>
              <Shield className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acciones Críticas</p>
                <p className="text-2xl font-bold text-red-600">{stats.summary.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Advertencias</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.summary.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="card-glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acciones Normales</p>
                <p className="text-2xl font-bold text-green-600">{stats.summary.info}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card-glass p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h3>
          <button
            onClick={resetFilters}
            className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todos los módulos</option>
            <option value="ventas">Ventas</option>
            <option value="inventario">Inventario</option>
            <option value="clientes">Clientes</option>
            <option value="proveedores">Proveedores</option>
            <option value="usuarios">Usuarios</option>
            <option value="caja">Caja</option>
            <option value="devoluciones">Devoluciones</option>
            <option value="ordenes_compra">Órdenes de Compra</option>
            <option value="configuracion">Configuración</option>
          </select>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todas las acciones</option>
            <optgroup label="Ventas">
              <option value="Creación de Venta">Creación de Venta</option>
              <option value="Anulación de Venta">Anulación de Venta</option>
              <option value="Modificación de Venta">Modificación de Venta</option>
            </optgroup>
            <optgroup label="Inventario">
              <option value="Creación de Producto">Creación de Producto</option>
              <option value="Eliminación de Producto">Eliminación de Producto</option>
              <option value="Modificación de Producto">Modificación de Producto</option>
              <option value="Ajuste de Stock">Ajuste de Stock</option>
            </optgroup>
            <optgroup label="Clientes">
              <option value="Creación de Cliente">Creación de Cliente</option>
              <option value="Eliminación de Cliente">Eliminación de Cliente</option>
              <option value="Modificación de Cliente">Modificación de Cliente</option>
            </optgroup>
            <optgroup label="Usuarios y Seguridad">
              <option value="Inicio de Sesión Exitoso">Inicio de Sesión Exitoso</option>
              <option value="Intento de Inicio de Sesión Fallido">Intento Fallido</option>
              <option value="Creación de Usuario">Creación de Usuario</option>
              <option value="Eliminación de Usuario">Eliminación de Usuario</option>
              <option value="Cambio de Rol">Cambio de Rol</option>
            </optgroup>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todas las severidades</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
            className="form-input"
          >
            <option value="">Todas las entidades</option>
            <option value="Factura">Factura</option>
            <option value="Producto">Producto</option>
            <option value="Cliente">Cliente</option>
            <option value="Proveedor">Proveedor</option>
            <option value="Usuario">Usuario</option>
            <option value="Caja">Caja</option>
            <option value="Devolución">Devolución</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            className="form-input"
            placeholder="Fecha inicio"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            className="form-input"
            placeholder="Fecha fin"
          />
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Shield className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay logs de auditoría disponibles</p>
            <p className="text-sm mt-2">Los eventos de usuario aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(log.timestamp).toLocaleString("es-DO")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{log.userInfo?.name}</div>
                            <div className="text-xs text-gray-500">{log.userInfo?.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getModuleBadge(log.module)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">{log.entity.type}</div>
                          <div className="text-xs text-gray-500">{log.entity.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                        <p className="line-clamp-2">{log.description}</p>
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

            {/* Paginación */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Página {pagination.page} de {pagination.pages}
                  </span>
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

      {/* Modal de detalles */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Detalles de Auditoría</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Usuario */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Usuario</h3>
                  <p className="text-lg font-medium">{selectedLog.userInfo?.name} ({selectedLog.userInfo?.email})</p>
                  <p className="text-sm text-gray-600">Rol: {selectedLog.userInfo?.role}</p>
                </div>

                {/* Fecha y Hora */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</h3>
                  <p className="text-lg">{new Date(selectedLog.timestamp).toLocaleString("es-DO", {
                    dateStyle: "full",
                    timeStyle: "long"
                  })}</p>
                </div>

                {/* Módulo y Acción */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Módulo</h3>
                    {getModuleBadge(selectedLog.module)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Severidad</h3>
                    {getSeverityBadge(selectedLog.severity)}
                  </div>
                </div>

                {/* Acción */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Acción Realizada</h3>
                  <p className="text-lg font-medium">{selectedLog.action}</p>
                </div>

                {/* Entidad */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Entidad Afectada</h3>
                  <p className="text-lg">{selectedLog.entity.type}: <span className="font-medium">{selectedLog.entity.name}</span></p>
                  <p className="text-sm text-gray-600">ID: {selectedLog.entity.id}</p>
                </div>

                {/* Descripción */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                  <p className="text-gray-800 whitespace-pre-line">{selectedLog.description}</p>
                </div>

                {/* Cambios */}
                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Cambios Realizados</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedLog.changes.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">{change.fieldLabel}:</span>
                          <span className="text-gray-500 line-through">{String(change.oldValue)}</span>
                          <span>→</span>
                          <span className="text-green-600 font-medium">{String(change.newValue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadatos */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Información Adicional</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
