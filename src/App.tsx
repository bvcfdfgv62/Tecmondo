import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicBudgetForm from './pages/PublicBudgetForm';
import PublicBudgetView from './pages/PublicBudgetView';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import CashFlow from './pages/CashFlow';
import Login from './pages/Login';
import ServiceOrders from './pages/ServiceOrders';
import ServiceOrderDetail from './pages/ServiceOrderDetail';
import ServiceOrderPrint from './pages/ServiceOrderPrint';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Settings from './pages/Settings';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />


        {/* Rotas Privadas/Admin */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />



        <Route path="/fluxo" element={
          <ProtectedRoute>
            <AdminLayout>
              <CashFlow />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/os" element={
          <ProtectedRoute>
            <AdminLayout>
              <ServiceOrders />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/os/:id" element={
          <ProtectedRoute>
            <AdminLayout>
              <ServiceOrderDetail />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/os/:id/imprimir" element={
          <ProtectedRoute>
            <ServiceOrderPrint />
          </ProtectedRoute>
        } />

        <Route path="/clientes" element={
          <ProtectedRoute>
            <AdminLayout>
              <Clients />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/clientes/:id" element={
          <ProtectedRoute>
            <AdminLayout>
              <ClientDetail />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/configuracoes" element={
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;