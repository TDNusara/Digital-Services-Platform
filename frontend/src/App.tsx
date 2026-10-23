import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/public/LandingPage';
import { ServiceCatalogPage } from './pages/public/ServiceCatalogPage';
import { CustomerPortal } from './pages/customer/CustomerPortal';
import { WorkerWorkspace } from './pages/worker/WorkerWorkspace';
import { AdminControlCenter } from './pages/admin/AdminControlCenter';
import { NewOrderModal } from './components/order/NewOrderModal';
import { OrderDetailsModal } from './components/order/OrderDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import api from './api/client';
import './styles/global.css';
import './styles/components.css';

const MainApplication: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'portal'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Data State
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
    setCurrentTab('portal');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-mesh" />

      {/* Primary Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        openLoginModal={() => setIsAuthModalOpen(true)}
        openNewOrderModal={() => handleOpenOrderModal(false, null)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentTab === 'home' && (
          <LandingPage
            categories={categories}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setCurrentTab('catalog');
            }}
            openNewOrderModal={() => handleOpenOrderModal(false, null)}
            setCurrentTab={(tab) => setCurrentTab(tab as any)}
          />
        )}

        {currentTab === 'catalog' && (
          <ServiceCatalogPage
            categories={categories}
            services={services}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectServiceToOrder={(service) => handleOpenOrderModal(false, service)}
            onRequestCustomService={() => handleOpenOrderModal(true, null)}
          />
        )}

        {currentTab === 'portal' && (
          <div>
            {!isAuthenticated ? (
              <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
                <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Authentication Required</h3>
                  <p style={{ marginBottom: '1.5rem' }}>
                    Please sign in or select a demo role from the top ribbon to access this workspace.
                  </p>
                  <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                    Sign In to TaskPulse
                  </button>
                </div>
              </div>
            ) : user?.role === 'ADMIN' ? (
              <AdminControlCenter
                orders={orders}
                onOpenOrderDetails={setSelectedOrderDetails}
                onRefresh={loadOrders}
                categories={categories}
                onServicesUpdated={loadPlatformCatalog}
              />
            ) : user?.role === 'WORKER' ? (
              <WorkerWorkspace
                orders={orders}
                onOpenOrderDetails={setSelectedOrderDetails}
                onRefresh={loadOrders}
              />
            ) : (
              <CustomerPortal
                orders={orders}
                onOpenOrderDetails={setSelectedOrderDetails}
                onOpenNewOrderModal={(customMode) => handleOpenOrderModal(Boolean(customMode), null)}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

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
