/**
 * @file Returns.jsx
 * @description Gestión de devoluciones de productos
 * 
 * Responsabilidades:
 * - Listar devoluciones con filtros (status, fechas, búsqueda)
 * - Crear nueva devolución (cajero puede crear)
 * - Ver detalle de devolución
 * - Aprobar/Rechazar devolución (solo admin)
 * - Mostrar estadísticas de devoluciones
 * 
 * Estados:
 * - returns: Array de devoluciones desde backend
 * - stats: Objeto con totalReturns, pendingReturns, approvedReturns, totalAmount
 * - sales: Array de ventas (para seleccionar en crear devolución)
 * - filters: { status, search, startDate, endDate }
 * - showCreateModal: Boolean para modal crear
 * - showDetailModal: Boolean para modal detalle
 * - selectedReturn: Devolución seleccionada para detalle
 * 
 * APIs:
 * - GET /api/returns (con filtros)
 * - GET /api/returns/stats (estadísticas)
 * - POST /api/returns (crear devolución)
 * - GET /api/returns/:id (detalle)
 * - PUT /api/returns/:id/approve (aprobar, solo admin)
 * - PUT /api/returns/:id/reject (rechazar, solo admin)
 * - GET /api/sales (para listar ventas en crear devolución)
 * 
 * Flujo de Devolución:
 * 1. Cajero selecciona venta y productos a devolver
 * 2. Especifica razón y método de reembolso
 * 3. Devolución se crea con status 'Pendiente'
 * 4. Admin revisa y aprueba/rechaza
 * 5. Si aprueba: stock se devuelve + reembolso procesado
 * 
 * Form Data (Crear):
 * - sale: ID de la venta original
 * - items: Array de { product, quantity, priceAtSale }
 * - reason: 'Producto defectuoso', 'Producto equivocado', 'Cliente insatisfecho', 'Otra'
 * - refundMethod: 'Efectivo', 'Tarjeta', 'Crédito a cuenta'
 * - notes: Notas adicionales
 * 
 * UI Features:
 * - Tarjetas de estadísticas (KPIs)
 * - Tabla de devoluciones con badges de status
 * - Filtros expandibles
 * - Modal de detalle con historial
 * - Botones de aprobar/rechazar (solo admin, solo pendientes)
 */

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  FileText,
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getReturns, getReturnStats, createReturn, getSales } from '../services/api';
import { ReportsSkeleton } from '../components/SkeletonLoader';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [returnsResponse, statsResponse] = await Promise.all([
        getReturns(filters),
        getReturnStats(filters),
      ]);
      
      // Asegurar que returnsData es un array
      const returnsData = Array.isArray(returnsResponse?.data) 
        ? returnsResponse.data 
        : Array.isArray(returnsResponse) 
          ? returnsResponse 
          : [];
      
      // Asegurar que statsData tiene la estructura correcta
      const statsData = statsResponse?.data || statsResponse || null;
      
      setReturns(returnsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar devoluciones:', error);
      toast.error('Error al cargar devoluciones');
      setReturns([]); // Asegurar que returns siempre sea un array
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReturn = async (returnData) => {
    try {
      await createReturn(returnData);
      toast.success('Devolución creada exitosamente');
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear devolución:', error);
      toast.error(error.response?.data?.message || 'Error al crear devolución');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Aprobada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Completada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Rechazada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getReasonBadge = (reason) => {
    const badges = {
      Defectuoso: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Incorrecto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'No necesario': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Cambio: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      Otro: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return badges[reason] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (isLoading && returns.length === 0) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Devoluciones y Reembolsos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las devoluciones de productos y reembolsos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          Nueva Devolución
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Devoluciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.totalReturns || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monto Devuelto
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(stats?.totalAmountReturned || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats?.returnsByStatus?.find(s => s._id === 'Pendiente')?.count || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completadas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats?.returnsByStatus?.find(s => s._id === 'Completada')?.count || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card-glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar por número
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="DEV-000001"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Completada">Completada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Devoluciones */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Venta Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Razón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(returns) && returns.map((returnItem) => (
                <tr 
                  key={returnItem._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {returnItem.returnNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {returnItem.sale?.invoiceNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {returnItem.customer?.fullName || 'Cliente General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReasonBadge(returnItem.reason)}`}>
                      {returnItem.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(returnItem.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(returnItem.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setShowDetailModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {returns.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron devoluciones
            </p>
          </div>
        )}
      </div>

      {/* Modal de Nueva Devolución */}
      {showCreateModal && (
        <CreateReturnModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReturn}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Modal de Detalle */}
      {showDetailModal && selectedReturn && (
        <ReturnDetailModal
          returnData={selectedReturn}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReturn(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getReasonBadge={getReasonBadge}
        />
      )}
    </div>
  );
};

// Modal para crear nueva devolución
const CreateReturnModal = ({ onClose, onSubmit, formatCurrency }) => {
  const [step, setStep] = useState(1); // 1: Buscar venta, 2: Seleccionar items, 3: Detalles
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('Efectivo');
  const [isSearching, setIsSearching] = useState(false);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const searchSales = async () => {
    if (!searchTerm) {
      toast.error('Ingrese un número de factura');
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await getSales({ search: searchTerm });
      
      // Asegurar que response es un array
      const salesData = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response) 
          ? response 
          : [];
      
      // Filtrar ventas válidas para devolución
      const validSales = salesData.filter(sale => 
        sale.status !== 'Cancelada' && sale.status !== 'Devuelta'
      );
      
      setSales(validSales);
      
      if (validSales.length === 0) {
        toast.error('No se encontraron ventas con ese número de factura');
      }
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      toast.error(error.response?.data?.message || 'Error al buscar ventas');
      setSales([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSale = (sale) => {
    setSelectedSale(sale);
    
    // Validar que la venta tenga items
    if (!sale.items || sale.items.length === 0) {
      toast.error('Esta venta no tiene productos');
      return;
    }
    
    setReturnItems(
      sale.items.map(item => ({
        productId: item.product?._id || item.product,
        productName: item.product?.name || 'Producto',
        maxQuantity: item.quantity,
        priceAtSale: item.priceAtSale,
        quantity: 0,
        selected: false,
      }))
    );
    setStep(2);
  };

  const toggleItem = (index) => {
    const newItems = [...returnItems];
    newItems[index].selected = !newItems[index].selected;
    if (newItems[index].selected && newItems[index].quantity === 0) {
      newItems[index].quantity = newItems[index].maxQuantity;
    }
    setReturnItems(newItems);
  };

  const updateQuantity = (index, quantity) => {
    const newItems = [...returnItems];
    // Permitir valores vacíos temporalmente
    if (quantity === '' || quantity === null || quantity === undefined) {
      newItems[index].quantity = '';
      setReturnItems(newItems);
      return;
    }
    const qty = parseInt(quantity);
    if (!isNaN(qty)) {
      newItems[index].quantity = Math.min(Math.max(0, qty), newItems[index].maxQuantity);
      setReturnItems(newItems);
    }
  };

  const getTotalAmount = () => {
    return returnItems
      .filter(item => item.selected && item.quantity > 0)
      .reduce((sum, item) => {
        const qty = typeof item.quantity === 'number' ? item.quantity : (parseInt(item.quantity) || 0);
        return sum + (item.priceAtSale * qty);
      }, 0);
  };

  const handleSubmit = () => {
    const selectedItems = returnItems.filter(item => item.selected && item.quantity > 0);
    
    if (selectedItems.length === 0) {
      toast.error('Debe seleccionar al menos un producto');
      return;
    }

    if (!reason) {
      toast.error('Debe seleccionar una razón');
      return;
    }

    onSubmit({
      saleId: selectedSale._id,
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      reason,
      notes,
      refundMethod,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nueva Devolución
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className={`w-20 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Buscar venta */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar venta por número de factura
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSales()}
                    placeholder="Ingrese número de factura..."
                    className="input flex-1"
                  />
                  <button onClick={searchSales} className="btn-primary flex items-center gap-2" disabled={isSearching}>
                    <Search className="w-5 h-5" />
                    Buscar
                  </button>
                </div>
              </div>

              {sales.length > 0 && (
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div
                      key={sale._id}
                      onClick={() => selectSale(sale)}
                      className="card-glass p-4 cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {sale.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sale.customer?.fullName || 'Cliente General'} • {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(sale.total)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sale.items.length} productos
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Seleccionar items */}
          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Cambiar venta
              </button>

              <div className="card-glass p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Venta seleccionada</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedSale.invoiceNumber}</p>
              </div>

              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  Seleccione los productos a devolver:
                </p>
                <div className="space-y-2">
                  {returnItems.map((item, index) => (
                    <div key={index} className="card-glass p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(index)}
                          className="w-5 h-5 text-primary-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Precio: {formatCurrency(item.priceAtSale)} • Máx: {item.maxQuantity}
                          </p>
                        </div>
                        {item.selected && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">
                              Cantidad:
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, e.target.value)}
                              className="input w-20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-glass p-4 border-2 border-primary-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total a devolver:</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(getTotalAmount())}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={getTotalAmount() === 0}
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 3: Detalles */}
          {step === 3 && (
            <div className="space-y-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Razón de la devolución <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Seleccione una razón</option>
                  <option value="Defectuoso">Defectuoso</option>
                  <option value="Incorrecto">Incorrecto</option>
                  <option value="No necesario">No necesario</option>
                  <option value="Cambio">Cambio</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de reembolso <span className="text-red-500">*</span>
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="input"
                  required
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Crédito en Tienda">Crédito en Tienda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Describa más detalles sobre la devolución..."
                />
              </div>

              <div className="card-glass p-4 border-2 border-primary-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Total a devolver:</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(getTotalAmount())}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Método: {refundMethod}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="btn btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Procesar Devolución
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal de detalle de devolución
const ReturnDetailModal = ({ returnData, onClose, formatCurrency, formatDate, getStatusBadge, getReasonBadge }) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalle de Devolución
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{returnData.returnNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Info General */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Venta Original</p>
              <p className="font-medium text-gray-900 dark:text-white">{returnData.sale?.invoiceNumber}</p>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {returnData.customer?.fullName || 'Cliente General'}
              </p>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(returnData.status)}`}>
                {returnData.status}
              </span>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Razón</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getReasonBadge(returnData.reason)}`}>
                {returnData.reason}
              </span>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Método de Reembolso</p>
              <p className="font-medium text-gray-900 dark:text-white">{returnData.refundMethod}</p>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(returnData.createdAt)}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Productos Devueltos
            </h3>
            <div className="space-y-2">
              {returnData.items.map((item, index) => (
                <div key={index} className="card-glass p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.product?.name || 'Producto'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {item.quantity} × {formatCurrency(item.originalPrice)}
                      </p>
                    </div>
                    <p className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(item.returnAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          {returnData.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Notas
              </h3>
              <div className="card-glass p-4">
                <p className="text-gray-700 dark:text-gray-300">{returnData.notes}</p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="card-glass p-6 border-2 border-primary-500/30">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-700 dark:text-gray-300">Total Devuelto:</span>
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(returnData.totalAmount)}
              </span>
            </div>
          </div>

          {/* Procesado por */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Procesado por: <span className="font-medium">{returnData.processedBy?.name}</span>
            </p>
            {returnData.approvedBy && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Aprobado por: <span className="font-medium">{returnData.approvedBy?.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
