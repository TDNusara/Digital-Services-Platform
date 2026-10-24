import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { RoleSidebarLayout } from './components/layout/RoleSidebarLayout';
import { LandingPage } from './pages/public/LandingPage';
import { ServiceCatalogPage } from './pages/public/ServiceCatalogPage';
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerRegisterPage } from './pages/auth/CustomerRegisterPage';
import { WorkerRegisterPage } from './pages/auth/WorkerRegisterPage';
import { CustomerPortal } from './pages/customer/CustomerPortal';
import { WorkerWorkspace } from './pages/worker/WorkerWorkspace';
import { AdminControlCenter } from './pages/admin/AdminControlCenter';
import { NewOrderModal } from './components/order/NewOrderModal';
import { OrderDetailsModal } from './components/order/OrderDetailsModal';
import api from './api/client';
import './styles/global.css';
import './styles/components.css';

type PageRoute =
  | 'home'
  | 'catalog'
  | 'login'
  | 'register-customer'
  | 'register-worker'
  | 'customer-portal'
  | 'worker-workspace'
  | 'admin-control';

const MainApplication: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<PageRoute>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Data State
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isCustomOrderMode, setIsCustomOrderMode] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState<any | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Fetch Categories & Services
  const loadPlatformCatalog = async () => {
    try {
      const [catRes, srvRes] = await Promise.all([
        api.get('/categories'),
        api.get('/services'),
      ]);
      setCategories(catRes.categories || []);
      setServices(srvRes.services || []);
    } catch (err) {
      console.error('Failed to load platform catalog:', err);
    }
  };

  // Fetch Orders for logged-in user
  const loadOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    setIsLoadingData(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadPlatformCatalog();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, user?.role]);

  const handleOpenOrderModal = (customMode: boolean = false, service: any = null) => {
    setIsCustomOrderMode(customMode);
    setPreSelectedService(service);
    setIsNewOrderModalOpen(true);
  };

  const handleOrderCreated = (newOrder: any) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCurrentTab('customer-portal');
  };

  const handleOrderUpdated = async () => {
    await loadOrders();
    if (selectedOrderDetails) {
      try {
        const fresh = await api.get(`/orders/${selectedOrderDetails.id}`);
        setSelectedOrderDetails(fresh.order);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sub-tabs for Independent Role Sidebars
  const [customerSubTab, setCustomerSubTab] = useState<'orders' | 'services' | 'transactions' | 'notifications' | 'profile'>('orders');
  const [workerSubTab, setWorkerSubTab] = useState<string>('workspace');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'services' | 'workers'>('orders');

  const isRoleDashboard = ['customer-portal', 'worker-workspace', 'admin-control'].includes(currentTab);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-mesh" />

      {/* 1. PUBLIC VIEW: Shows PublicNavbar only when browsing public pages */}
      {!isRoleDashboard && (
        <PublicNavbar
          currentTab={currentTab}
          setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
          openNewOrderModal={() => handleOpenOrderModal(false, null)}
        />
      )}

      {/* 2. MAIN APPLICATION CONTENT */}
      {/* CASE A: PUBLIC LANDING PAGE */}
      {currentTab === 'home' && (
        <main style={{ flex: 1 }}>
          <LandingPage
            categories={categories}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setCurrentTab('catalog');
            }}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
            setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
          />
        </main>
      )}

      {/* CASE B: PUBLIC SERVICES CATALOG */}
      {currentTab === 'catalog' && (
        <main style={{ flex: 1 }}>
          <ServiceCatalogPage
            categories={categories}
            services={services}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectServiceToOrder={(service) => handleOpenOrderModal(false, service)}
            onRequestCustomService={() => handleOpenOrderModal(true, null)}
          />
        </main>
      )}

      {/* CASE C: AUTH PAGES */}
      {currentTab === 'login' && (
        <main style={{ flex: 1 }}>
          <LoginPage onNavigate={(page) => setCurrentTab(page as PageRoute)} />
        </main>
      )}

      {currentTab === 'register-customer' && (
        <main style={{ flex: 1 }}>
          <CustomerRegisterPage onNavigate={(page) => setCurrentTab(page as PageRoute)} />
        </main>
      )}

      {currentTab === 'register-worker' && (
        <main style={{ flex: 1 }}>
          <WorkerRegisterPage onNavigate={(page) => setCurrentTab(page as PageRoute)} categories={categories} />
        </main>
      )}

      {/* CASE D: INDEPENDENT CUSTOMER WORKSPACE WITH DEDICATED SIDEBAR */}
      {currentTab === 'customer-portal' && (
        <RoleSidebarLayout
          role="CUSTOMER"
          activeSubTab={customerSubTab}
          onSelectSubTab={(tab) => setCustomerSubTab(tab as any)}
          onNavigate={(route) => setCurrentTab(route as PageRoute)}
          openNewOrderModal={() => handleOpenOrderModal(false, null)}
          orders={orders}
        >
          {!isAuthenticated ? (
            <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
              <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Customer Sign In Required</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Sign in to your customer account to view your orders, review quotations, and download deliverables.
                </p>
                <button className="btn btn-primary" onClick={() => setCurrentTab('login')}>
                  Sign In to Customer Workspace
                </button>
              </div>
            </div>
          ) : (
            <CustomerPortal
              orders={orders}
              onOpenOrderDetails={setSelectedOrderDetails}
              onOpenNewOrderModal={(customMode, service) => handleOpenOrderModal(Boolean(customMode), service || null)}
              categories={categories}
              services={services}
              activeTab={customerSubTab}
              onTabChange={setCustomerSubTab}
            />
          )}
        </RoleSidebarLayout>
      )}

      {/* CASE E: INDEPENDENT SPECIALIST WORKSPACE WITH DEDICATED SIDEBAR */}
      {currentTab === 'worker-workspace' && (
        <RoleSidebarLayout
          role="WORKER"
          activeSubTab={workerSubTab}
          onSelectSubTab={setWorkerSubTab}
          onNavigate={(route) => setCurrentTab(route as PageRoute)}
          openNewOrderModal={() => handleOpenOrderModal(false, null)}
          orders={orders}
        >
          {!isAuthenticated ? (
            <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
              <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Specialist Login Required</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Please sign in to your specialist account to accept tasks and upload deliverables for QC review.
                </p>
                <button className="btn btn-primary" onClick={() => setCurrentTab('login')}>
                  Sign In as Specialist
                </button>
              </div>
            </div>
          ) : (
            <WorkerWorkspace
              orders={orders}
              onOpenOrderDetails={setSelectedOrderDetails}
              onRefresh={loadOrders}
            />
          )}
        </RoleSidebarLayout>
      )}

      {/* CASE F: INDEPENDENT ADMIN CONTROL CENTER WITH DEDICATED SIDEBAR */}
      {currentTab === 'admin-control' && (
        <RoleSidebarLayout
          role="ADMIN"
          activeSubTab={adminSubTab}
          onSelectSubTab={(tab) => setAdminSubTab(tab as any)}
          onNavigate={(route) => setCurrentTab(route as PageRoute)}
          openNewOrderModal={() => handleOpenOrderModal(false, null)}
          orders={orders}
        >
          {!isAuthenticated || user?.role !== 'ADMIN' ? (
            <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
              <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Administrator Access Required</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  This section is restricted to operations administrators.
                </p>
                <button className="btn btn-primary" onClick={() => setCurrentTab('login')}>
                  Sign In as Administrator
                </button>
              </div>
            </div>
          ) : (
            <AdminControlCenter
              orders={orders}
              onOpenOrderDetails={setSelectedOrderDetails}
              onRefresh={loadOrders}
              categories={categories}
              onServicesUpdated={loadPlatformCatalog}
              activeTab={adminSubTab}
              onTabChange={setAdminSubTab}
            />
          )}
        </RoleSidebarLayout>
      )}

      {/* Modals for Orders */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        categories={categories}
        services={services}
        preSelectedService={preSelectedService}
        initialCustomMode={isCustomOrderMode}
        onOrderCreated={handleOrderCreated}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrderDetails}
        order={selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
};

export default App;
