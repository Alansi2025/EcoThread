import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { CertificateVerificationModal } from './components/CertificateVerificationModal';
import { AiGarmentScannerModal } from './components/AiGarmentScannerModal';
import { NgoNeedsLocatorModal } from './components/NgoNeedsLocatorModal';
import { GarmentPassportModal } from './components/GarmentPassportModal';
import { LiveLogisticsMapModal } from './components/LiveLogisticsMapModal';
import { DonorPortal } from './pages/donor/DonorPortal';
import { BeneficiaryStore } from './pages/beneficiary/BeneficiaryStore';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LogisticsDashboard } from './pages/logistics/LogisticsDashboard';
import { CampusCircularityDashboard } from './pages/campus/CampusCircularityDashboard';
import { CartDrawer } from './pages/beneficiary/CartDrawer';

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donor');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  
  // High-Impact Hackathon Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNgoLocatorOpen, setIsNgoLocatorOpen] = useState(false);
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);
  const [liveMapPickupId, setLiveMapPickupId] = useState(null);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [activePassportId, setActivePassportId] = useState('ECO-TRC-2026-8841');

  const handleOpenPassport = (passportId) => {
    if (passportId) setActivePassportId(passportId);
    setIsPassportOpen(true);
  };

  const handleOpenLiveMap = (pickupId = null) => {
    setLiveMapPickupId(pickupId);
    setIsLiveMapOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1-Click Persona Role Switcher */}
      <RoleSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Primary Brand Navbar with Innovation Triggers */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenVerify={() => setIsVerifyOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNgoLocator={() => setIsNgoLocatorOpen(true)}
        onOpenLiveMap={() => handleOpenLiveMap()}
        onOpenPassport={handleOpenPassport}
      />

      {/* Main Routed Portal View */}
      <main className="flex-1 pb-16">
        {activeTab === 'donor' && (
          <DonorPortal 
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNgoLocator={() => setIsNgoLocatorOpen(true)}
            onOpenLiveMap={handleOpenLiveMap}
            onOpenPassport={handleOpenPassport}
          />
        )}
        {activeTab === 'campus' && (
          <CampusCircularityDashboard 
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNgoLocator={() => setIsNgoLocatorOpen(true)}
            onOpenPassport={handleOpenPassport}
          />
        )}
        {activeTab === 'beneficiary' && (
          <BeneficiaryStore 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenPassport={handleOpenPassport}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboard 
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenPassport={handleOpenPassport}
          />
        )}
        {activeTab === 'logistics' && (
          <LogisticsDashboard 
            onOpenNgoLocator={() => setIsNgoLocatorOpen(true)}
          />
        )}
      </main>

      {/* AI Garment Defect & Circularity Scanner Modal */}
      <AiGarmentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOpenPassport={handleOpenPassport}
        onOpenNgoLocator={() => {
          setIsScannerOpen(false);
          setIsNgoLocatorOpen(true);
        }}
      />

      {/* NGO Urgent Needs & Smart Eco-Route Travel Locator Modal */}
      <NgoNeedsLocatorModal
        isOpen={isNgoLocatorOpen}
        onClose={() => setIsNgoLocatorOpen(false)}
        onSchedulePickup={() => {
          setIsNgoLocatorOpen(false);
          setActiveTab('donor');
        }}
      />

      {/* Live NGO Locations & Active Logistics Fleet Radar */}
      <LiveLogisticsMapModal
        isOpen={isLiveMapOpen}
        onClose={() => setIsLiveMapOpen(false)}
        selectedPickupId={liveMapPickupId}
        onSchedulePickup={() => {
          setIsLiveMapOpen(false);
          setActiveTab('donor');
        }}
      />

      {/* Garment Digital Product Passport Modal */}
      <GarmentPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        initialPassportId={activePassportId}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={() => {}}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onRoleSelect={(roleTab) => setActiveTab(roleTab)}
      />

      {/* Global 80G Certificate Verification Modal */}
      <CertificateVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      {/* Platform Footer with functional tab navigation and modal triggers */}
      <Footer 
        onTabChange={setActiveTab}
        onOpenVerify={() => setIsVerifyOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
