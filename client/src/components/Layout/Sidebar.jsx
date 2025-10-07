/**
 * @file Sidebar.jsx
 * @description Menú lateral de navegación con subsecciones expandibles
 * 
 * Responsabilidades:
 * - Mostrar logo del negocio (desde settings)
 * - Renderizar menú de navegación con iconos (lucide-react)
 * - Secciones expandibles: Ventas, Inventario, Contactos, Caja, Configuración
 * - Ocultar rutas de admin si el usuario no es admin
 * 
 * Estructura de Menú:
 * - Dashboard (sin subsecciones)
 * - Ventas: Facturación, Historial, Devoluciones
 * - Inventario: Productos, Órdenes de Compra
 * - Contactos: Clientes, Proveedores
 * - Caja: Cierre de Caja, Retiros de Caja
 * - Usuarios (solo admin)
 * - Reportes (solo admin)
 * - Configuración (solo admin): Negocio, Sistema, Notificaciones, Facturación, Integraciones
 * 
 * Estados:
 * - configExpanded, ventasExpanded, inventarioExpanded, contactosExpanded, cajaExpanded
 * - Se inicializan basados en la ruta actual (location.pathname)
 * 
 * Estilos:
 * - NavLink con clases activas (.active) para resaltar ruta actual
 * - Glassmorphism (glass-strong) y animaciones de hover
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import {
  Home,
  FileText,
  Package,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  UserCog,
  ShoppingCart,
  Truck,
  ClipboardList,
  RefreshCw,
  Receipt,
  ChevronDown,
  ChevronRight,
  Building2,
  Globe,
  Bell,
  CreditCard,
  Cloud,
  Activity,
  Shield,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  
  // Estados para controlar expansión de secciones
  const [configExpanded, setConfigExpanded] = useState(location.pathname.startsWith('/configuracion'));
  const [ventasExpanded, setVentasExpanded] = useState(
    location.pathname.includes('/facturacion') || 
    location.pathname.includes('/historial-ventas') || 
    location.pathname.includes('/devoluciones')
  );
  const [inventarioExpanded, setInventarioExpanded] = useState(
    location.pathname.includes('/inventario') || 
    location.pathname.includes('/ordenes-compra')
  );
  const [contactosExpanded, setContactosExpanded] = useState(
    location.pathname.includes('/clientes') || 
    location.pathname.includes('/proveedores')
  );
  const [cajaExpanded, setCajaExpanded] = useState(
    location.pathname.includes('/cierre-caja') || 
    location.pathname.includes('/retiros-caja')
  );
  const [sistemaExpanded, setSistemaExpanded] = useState(
    location.pathname.includes('/logs') || 
    location.pathname.includes('/auditoria') || 
    location.pathname.includes('/monitoreo')
  );

  // Secciones principales sin subsecciones
  const mainItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
  ];

  // Subsecciones de Ventas
  const ventasSections = [
    { path: '/facturacion', icon: ShoppingCart, label: 'Nueva Factura', shortcut: 'Ctrl+B' },
    { path: '/historial-ventas', icon: Receipt, label: 'Historial', shortcut: 'Ctrl+H' },
    { path: '/devoluciones', icon: RefreshCw, label: 'Devoluciones' },
  ];

  // Subsecciones de Inventario
  const inventarioSections = [
    { path: '/inventario', icon: Package, label: 'Productos', shortcut: 'Ctrl+I' },
    { path: '/ordenes-compra', icon: ClipboardList, label: 'Órdenes de Compra' },
  ];

  // Subsecciones de Contactos
  const contactosSections = [
    { path: '/clientes', icon: Users, label: 'Clientes', shortcut: 'Ctrl+C' },
    { path: '/proveedores', icon: Truck, label: 'Proveedores' },
  ];

  // Subsecciones de Caja
  const cajaSections = [
    { path: '/cierre-caja', icon: DollarSign, label: 'Cierre de Caja' },
    { path: '/retiros-caja', icon: Receipt, label: 'Retiros de Caja' },
  ];

  // Subsecciones de Sistema (Logs y Monitoreo)
  const sistemaSections = [
    { path: '/logs', icon: Activity, label: 'Logs Técnicos' },
    { path: '/auditoria', icon: Shield, label: 'Auditoría de Usuario' },
    { path: '/monitoreo', icon: Activity, label: 'Monitoreo en Tiempo Real' },
  ];

  // Secciones administrativas (solo para administradores)
  const adminItems = [
    { path: '/reportes', icon: BarChart3, label: 'Reportes', shortcut: 'Ctrl+R' },
    { path: '/usuarios', icon: UserCog, label: 'Usuarios' },
  ];

  // Subsecciones de Configuración
  const configSections = [
    { path: '/configuracion/negocio', icon: Building2, label: 'Negocio', shortcut: 'Ctrl+,' },
    { path: '/configuracion/sistema', icon: Globe, label: 'Sistema' },
    { path: '/configuracion/notificaciones', icon: Bell, label: 'Notificaciones' },
    { path: '/configuracion/facturacion', icon: CreditCard, label: 'Facturación' },
    { path: '/configuracion/integraciones', icon: Cloud, label: 'Integraciones' },
  ];

  return (
    <aside className="w-64 glass-strong border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {settings.businessLogoUrl && settings.businessLogoUrl !== '/logo.png' && settings.businessLogoUrl !== '/default-logo.png' ? (
            <img 
              src={settings.businessLogoUrl} 
              alt={settings.businessName || 'Logo'}
              className="w-10 h-10 rounded-xl object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center"
            style={{ display: (settings.businessLogoUrl && settings.businessLogoUrl !== '/logo.png' && settings.businessLogoUrl !== '/default-logo.png') ? 'none' : 'flex' }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {settings.businessName || 'AutoParts Manager'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">POS System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Main Items */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Sección Ventas */}
        <div className="pt-2">
          <button
            onClick={() => setVentasExpanded(!ventasExpanded)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname.includes('/facturacion') || 
              location.pathname.includes('/historial-ventas') || 
              location.pathname.includes('/devoluciones')
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Ventas</span>
            {ventasExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {ventasExpanded && (
            <div className="mt-1 ml-4 space-y-1 animate-fade-in">
              {ventasSections.map((section) => (
                <NavLink
                  key={section.path}
                  to={section.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </div>
                  {section.shortcut && (
                    <kbd className="hidden lg:block px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                      {section.shortcut}
                    </kbd>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Sección Inventario */}
        <div>
          <button
            onClick={() => setInventarioExpanded(!inventarioExpanded)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname.includes('/inventario') || 
              location.pathname.includes('/ordenes-compra')
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Inventario</span>
            {inventarioExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {inventarioExpanded && (
            <div className="mt-1 ml-4 space-y-1 animate-fade-in">
              {inventarioSections.map((section) => (
                <NavLink
                  key={section.path}
                  to={section.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </div>
                  {section.shortcut && (
                    <kbd className="hidden lg:block px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                      {section.shortcut}
                    </kbd>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Sección Contactos */}
        <div>
          <button
            onClick={() => setContactosExpanded(!contactosExpanded)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname.includes('/clientes') || 
              location.pathname.includes('/proveedores')
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Contactos</span>
            {contactosExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {contactosExpanded && (
            <div className="mt-1 ml-4 space-y-1 animate-fade-in">
              {contactosSections.map((section) => (
                <NavLink
                  key={section.path}
                  to={section.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </div>
                  {section.shortcut && (
                    <kbd className="hidden lg:block px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                      {section.shortcut}
                    </kbd>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Sección Caja */}
        <div>
          <button
            onClick={() => setCajaExpanded(!cajaExpanded)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname.includes('/cierre-caja') || 
              location.pathname.includes('/retiros-caja')
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Caja</span>
            {cajaExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {cajaExpanded && (
            <div className="mt-1 ml-4 space-y-1 animate-fade-in">
              {cajaSections.map((section) => (
                <NavLink
                  key={section.path}
                  to={section.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Administración
            </p>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="hidden lg:block px-2 py-0.5 text-xs font-mono bg-white/20 dark:bg-gray-800 rounded border border-white/30 dark:border-gray-700">
                      {item.shortcut}
                    </kbd>
                  )}
                </NavLink>
              ))}

              {/* Sistema (Logs y Monitoreo) con subsecciones */}
              <div>
                <button
                  onClick={() => setSistemaExpanded(!sistemaExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname.includes('/logs') ||
                    location.pathname.includes('/auditoria') ||
                    location.pathname.includes('/monitoreo')
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">Sistema</span>
                  {sistemaExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Subsecciones de Sistema */}
                {sistemaExpanded && (
                  <div className="mt-1 ml-4 space-y-1 animate-fade-in">
                    {sistemaSections.map((section) => (
                      <NavLink
                        key={section.path}
                        to={section.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="w-4 h-4" />
                          <span>{section.label}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {/* Configuración con subsecciones */}
              <div>
                <button
                  onClick={() => setConfigExpanded(!configExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname.startsWith('/configuracion')
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">Configuración</span>
                  {configExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Subsecciones de Configuración */}
                {configExpanded && (
                  <div className="mt-1 ml-4 space-y-1 animate-fade-in">
                    {configSections.map((section) => (
                      <NavLink
                        key={section.path}
                        to={section.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="w-4 h-4" />
                          <span>{section.label}</span>
                        </div>
                        {section.shortcut && (
                          <kbd className="hidden lg:block px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                            {section.shortcut}
                          </kbd>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Keyboard Shortcuts Hint */}
      <div className="px-4 pb-2">
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-shortcuts-help'))}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span>Presiona</span>
          <kbd className="px-2 py-0.5 font-mono bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
            ?
          </kbd>
          <span>para ver atajos</span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
