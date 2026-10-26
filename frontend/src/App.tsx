import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { RoleSidebarLayout } from './components/layout/RoleSidebarLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerRegisterPage } from './pages/auth/CustomerRegisterPage';
import { WorkerRegisterPage } from './pages/auth/WorkerRegisterPage';
import { GuestHomePage } from './pages/public/GuestHomePage';
import { CustomerPortal } from './pages/customer/CustomerPortal';
import { WorkerWorkspace } from './pages/worker/WorkerWorkspace';
import { AdminControlCenter } from './pages/admin/AdminControlCenter';
import { NewOrderModal } from './components/order/NewOrderModal';
import { OrderDetailsModal } from './components/order/OrderDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import api from './api/client';
import './styles/global.css';
import './styles/components.css';

type PageRoute =
  | 'home'
  | 'guest-home'
  | 'catalog'
  | 'login'
  | 'register-customer'
  | 'register-worker'
  | 'customer-portal'
  | 'worker-workspace'
  | 'admin-control';

const MainApplication: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Navigation State - Defaults to home (renders Guest Home for guests, Customer Home for registered customers)
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register_customer' | 'apply_worker'>('login');

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
    // Guest users cannot order services - navigate directly to normal login / registration!
    if (!isAuthenticated) {
      setCurrentTab('login');
      return;
    }

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
  const [customerSubTab, setCustomerSubTab] = useState<'home' | 'orders' | 'services' | 'transactions' | 'notifications' | 'profile'>('home');
  const [workerSubTab, setWorkerSubTab] = useState<string>('workspace');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'services' | 'workers'>('orders');

  // Redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && ['login', 'register-customer'].includes(currentTab)) {
      setCurrentTab('customer-portal');
    } else if (isAuthenticated && user?.role === 'WORKER' && ['login', 'register-worker'].includes(currentTab)) {
      setCurrentTab('worker-workspace');
    } else if (isAuthenticated && user?.role === 'ADMIN' && currentTab === 'login') {
      setCurrentTab('admin-control');
    }
  }, [isAuthenticated, user?.role, currentTab]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading TaskPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-mesh" />

      {/* MAIN APPLICATION ROUTING */}
      {/* 1. AUTH PAGES (Login, Customer Register, Worker Application) with Navigation Bar */}
      {currentTab === 'login' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <PublicNavbar
            currentTab={currentTab}
            setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
          />
          <main style={{ flex: 1 }}>
            <LoginPage onNavigate={(page) => setCurrentTab(page as PageRoute)} />
          </main>
        </div>
      )}

      {currentTab === 'register-customer' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <PublicNavbar
            currentTab={currentTab}
            setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
          />
          <main style={{ flex: 1 }}>
            <CustomerRegisterPage onNavigate={(page) => setCurrentTab(page as PageRoute)} />
          </main>
        </div>
      )}

      {currentTab === 'register-worker' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <PublicNavbar
            currentTab={currentTab}
            setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
          />
          <main style={{ flex: 1 }}>
            <WorkerRegisterPage onNavigate={(page) => setCurrentTab(page as PageRoute)} categories={categories} />
          </main>
        </div>
      )}

      {/* 2. GUEST USER HOME PAGE (For visitors / non-authenticated users or when explicitly viewing guest view) */}
      {(
        (!isAuthenticated && ['home', 'guest-home', 'catalog', 'customer-portal'].includes(currentTab)) ||
        (isAuthenticated && currentTab === 'guest-home')
      ) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isAuthenticated && (
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))',
                borderBottom: '1px solid rgba(99, 102, 241, 0.4)',
                padding: '0.65rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>
                👤 Viewing Guest User Home Page while logged in as <strong>{user?.fullName}</strong> ({user?.role === 'CUSTOMER' ? 'Customer' : user?.role}).
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (user?.role === 'ADMIN') setCurrentTab('admin-control');
                  else if (user?.role === 'WORKER') setCurrentTab('worker-workspace');
                  else setCurrentTab('customer-portal');
                }}
                style={{ fontSize: '0.78rem' }}
              >
                Return to {user?.role === 'CUSTOMER' ? 'Customer Home' : 'Workspace'} →
              </button>
            </div>
          )}

          <PublicNavbar
            currentTab={currentTab}
            setCurrentTab={(tab) => setCurrentTab(tab as PageRoute)}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
          />

          <main style={{ flex: 1 }}>
            <GuestHomePage
              categories={categories}
              services={services}
              onSelectCategory={(slug) => setSelectedCategory(slug)}
              openNewOrderModal={(customMode, service) => handleOpenOrderModal(Boolean(customMode), service || null)}
              onNavigate={(tab) => setCurrentTab(tab as PageRoute)}
            />
          </main>
        </div>
      )}

      {/* 3. REGISTERED USER HOME PAGE & WORKSPACE WITH SIDE NAVBAR */}
      {isAuthenticated && user?.role === 'CUSTOMER' && (['home', 'catalog', 'customer-portal'].includes(currentTab)) && (
        <RoleSidebarLayout
          role="CUSTOMER"
          activeSubTab={currentTab === 'catalog' ? 'services' : customerSubTab}
          onSelectSubTab={(tab) => {
            if (currentTab !== 'customer-portal') setCurrentTab('customer-portal');
            setCustomerSubTab(tab as any);
          }}
          onNavigate={(route) => setCurrentTab(route as PageRoute)}
          openNewOrderModal={() => handleOpenOrderModal(false, null)}
          orders={orders}
        >
          <CustomerPortal
            orders={orders}
            onOpenOrderDetails={setSelectedOrderDetails}
            onOpenNewOrderModal={(customMode, service) => handleOpenOrderModal(Boolean(customMode), service || null)}
            categories={categories}
            services={services}
            activeTab={currentTab === 'catalog' ? 'services' : customerSubTab}
            onTabChange={(tab) => setCustomerSubTab(tab)}
          />
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

      {/* Modals for Orders & Auth */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        categories={categories}
        services={services}
        preSelectedService={preSelectedService}
        initialCustomMode={isCustomOrderMode}
        onOrderCreated={handleOrderCreated}
        onOpenAuth={(tab) => {
          if (tab === 'register_customer') {
            setCurrentTab('register-customer');
          } else {
            setCurrentTab('login');
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
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
