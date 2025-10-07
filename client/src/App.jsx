/**
 * @file App.jsx
 * @description Componente raíz de la aplicación con configuración de rutas
 * 
 * Responsabilidades:
 * - Configurar React Router con todas las rutas de la aplicación
 * - Implementar ProtectedRoute para rutas privadas y de admin
 * - Configurar Toaster global para notificaciones
 * - Aplicar tema claro/oscuro desde themeStore
 * 
 * Rutas:
 * - /login: Página de autenticación (pública)
 * - /: Layout principal (protegido) con subrutas:
 *   - Dashboard, Facturación, Inventario, Clientes, etc.
 *   - Rutas de admin: Usuarios, Reportes, Configuración
 * 
 * ProtectedRoute:
 * - Verifica isAuthenticated, redirige a /login si no hay sesión
 * - adminOnly=true verifica role='admin', redirige a / si no es admin
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useSettingsStore } from './store/settingsStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import CashRegister from './pages/CashRegister';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Returns from './pages/Returns';
import SalesHistory from './pages/SalesHistory';
import CashWithdrawals from './pages/CashWithdrawals';
import Logs from './pages/Logs';
import AuditLogs from './pages/AuditLogs';
import Monitoring from './pages/Monitoring';

// Layout
import Layout from './components/Layout/Layout';

// Keyboard Shortcuts
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Export AppRoutes separately for testing
export const AppRoutes = () => {
  const { isDarkMode } = useThemeStore();
  const { settings } = useSettingsStore();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <KeyboardShortcutsHelp />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="facturacion" element={<Billing />} />
          <Route path="inventario" element={<Inventory />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="proveedores" element={<Suppliers />} />
          <Route path="ordenes-compra" element={<PurchaseOrders />} />
          <Route path="devoluciones" element={<Returns />} />
          <Route path="historial-ventas" element={<SalesHistory />} />
          <Route path="cierre-caja" element={<CashRegister />} />
          <Route path="retiros-caja" element={<CashWithdrawals />} />
          
          {/* Admin Routes */}
          <Route
            path="usuarios"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes"
            element={
              <ProtectedRoute adminOnly>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="configuracion" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
          <Route path="configuracion/negocio" element={<ProtectedRoute adminOnly><Settings section="business" /></ProtectedRoute>} />
          <Route path="configuracion/sistema" element={<ProtectedRoute adminOnly><Settings section="system" /></ProtectedRoute>} />
          <Route path="configuracion/notificaciones" element={<ProtectedRoute adminOnly><Settings section="notifications" /></ProtectedRoute>} />
          <Route path="configuracion/facturacion" element={<ProtectedRoute adminOnly><Settings section="billing" /></ProtectedRoute>} />
          <Route path="configuracion/integraciones" element={<ProtectedRoute adminOnly><Settings section="integrations" /></ProtectedRoute>} />
          <Route path="logs" element={<ProtectedRoute adminOnly><Logs /></ProtectedRoute>} />
          <Route path="auditoria" element={<ProtectedRoute adminOnly><AuditLogs /></ProtectedRoute>} />
          <Route path="monitoreo" element={<ProtectedRoute adminOnly><Monitoring /></ProtectedRoute>} />
        </Route>
      </Routes>

      <Toaster
        position={settings.toastPosition || 'top-center'}
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#111827',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 200000,
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
