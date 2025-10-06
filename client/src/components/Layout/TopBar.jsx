/**
 * @file TopBar.jsx
 * @description Barra superior con widgets, tema y menú de usuario
 * 
 * Responsabilidades:
 * - Mostrar nombre del negocio (businessName desde settings)
 * - ClockWidget: Reloj en tiempo real con fecha
 * - WeatherWidget: Clima actual si está habilitado (settings.showWeather)
 * - Botón de tema: Alternar entre claro/oscuro (toggleTheme)
 * - Menú de usuario: Nombre, email, rol, botón de logout
 * 
 * Menú de Usuario:
 * - Se posiciona con createPortal (render fuera del DOM padre)
 * - Usa menuPosition calculado desde buttonRef.getBoundingClientRect()
 * - Cierra al hacer click fuera (useEffect con evento mousedown)
 * 
 * Estilos:
 * - Glassmorphism (glass-strong)
 * - Animaciones de hover y transiciones suaves
 * - Badge con rol del usuario (admin=rojo, cajero=azul)
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import ClockWidget from '../ClockWidget';
import WeatherWidget from '../WeatherWidget';

const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { settings } = useSettingsStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleMenu = () => {
    if (!showUserMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="glass-strong border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Business Name */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            {settings.businessName || 'AutoParts Manager'}
          </h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Clock Widget */}
          <ClockWidget />
          
          {/* Weather Widget */}
          {settings.showWeather && settings.weatherApiKey && (
            <WeatherWidget 
              location={settings.weatherLocation || 'Santo Domingo,DO'}
              apiKey={settings.weatherApiKey}
            />
          )}
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleToggleMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Portal */}
            {showUserMenu && createPortal(
              <>
                <div
                  className="fixed inset-0"
                  style={{ zIndex: 99998 }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div 
                  className="fixed w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2"
                  style={{ 
                    top: `${menuPosition.top}px`, 
                    right: `${menuPosition.right}px`,
                    zIndex: 99999
                  }}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Helper to get page title from current route
const getPageTitle = () => {
  const path = window.location.pathname;
  const titles = {
    '/': 'Dashboard',
    '/facturacion': 'Facturación',
    '/inventario': 'Inventario',
    '/clientes': 'Clientes',
    '/cierre-caja': 'Cierre de Caja',
    '/usuarios': 'Gestión de Usuarios',
    '/reportes': 'Reportes',
    '/configuracion': 'Configuración',
  };
  return titles[path] || 'AutoParts Manager';
};

export default TopBar;
