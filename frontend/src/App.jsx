import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Components & Pages
import { PublicNavbar } from './components/PublicNavbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Donor Components & Pages
import { DonorNavbar } from './components/DonorNavbar';
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage';
import { DonorCreatePage } from './pages/donor/DonorCreatePage';
import { DonorDonationsPage } from './pages/donor/DonorDonationsPage';
import { DonorHistoryPage } from './pages/donor/DonorHistoryPage';
import { DonorImpactPage } from './pages/donor/DonorImpactPage';
import { DonorProfilePage } from './pages/donor/DonorProfilePage';

// NGO Components & Pages
import { NgoNavbar } from './components/NgoNavbar';
import { NgoDashboardPage } from './pages/ngo/NgoDashboardPage';
import { NgoBrowsePage } from './pages/ngo/NgoBrowsePage';
import { NgoAcceptedPage } from './pages/ngo/NgoAcceptedPage';
import { NgoCollectionsPage } from './pages/ngo/NgoCollectionsPage';
import { NgoImpactPage } from './pages/ngo/NgoImpactPage';
import { NgoProfilePage } from './pages/ngo/NgoProfilePage';

// Shared Modals
import { CertificateVerificationModal } from './components/CertificateVerificationModal';
import { CartDrawer } from './pages/beneficiary/CartDrawer';
import { GarmentPassportModal } from './components/GarmentPassportModal';
import { NgoNeedsLocatorModal } from './components/NgoNeedsLocatorModal';

// Layout Wrappers
const PublicLayout = ({ children, onOpenVerify }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <PublicNavbar />
    <main className="flex-1">{children}</main>
    <Footer onOpenVerify={onOpenVerify} />
  </div>
);

const DonorLayout = ({ children, onOpenVerify }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <DonorNavbar />
    <main className="flex-1">{children}</main>
    <Footer onOpenVerify={onOpenVerify} />
  </div>
);

const NgoLayout = ({ children, onOpenCart, onOpenVerify }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <NgoNavbar onOpenCart={onOpenCart} />
    <main className="flex-1">{children}</main>
    <Footer onOpenVerify={onOpenVerify} />
  </div>
);

export default function App() {
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [activePassportId, setActivePassportId] = useState('ECO-TRC-2026-8841');
  const [isNgoLocatorOpen, setIsNgoLocatorOpen] = useState(false);

  const handleOpenPassport = (id = 'ECO-TRC-2026-8841') => {
    setActivePassportId(id);
    setIsPassportOpen(true);
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            
            {/* PUBLIC ROUTES */}
            <Route
              path="/"
              element={
                <PublicLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                  <AboutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <PublicLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                  <HowItWorksPage />
                </PublicLayout>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* DONOR PROTECTED ROUTES */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorDashboardPage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/create"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorCreatePage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/donations"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorDonationsPage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/history"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorHistoryPage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/impact"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorImpactPage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/profile"
              element={
                <ProtectedRoute allowedRole="ROLE_DONOR">
                  <DonorLayout onOpenVerify={() => setIsVerifyOpen(true)}>
                    <DonorProfilePage />
                  </DonorLayout>
                </ProtectedRoute>
              }
            />

            {/* NGO PROTECTED ROUTES */}
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoDashboardPage />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/browse"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoBrowsePage />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/accepted"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoAcceptedPage />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/collections"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoCollectionsPage onOpenNgoLocator={() => setIsNgoLocatorOpen(true)} />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/impact"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoImpactPage />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/profile"
              element={
                <ProtectedRoute allowedRole="ROLE_NGO">
                  <NgoLayout onOpenCart={() => setIsCartOpen(true)} onOpenVerify={() => setIsVerifyOpen(true)}>
                    <NgoProfilePage />
                  </NgoLayout>
                </ProtectedRoute>
              }
            />

            {/* CATCH-ALL REDIRECT */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

          {/* Shared Modals */}
          <CertificateVerificationModal
            isOpen={isVerifyOpen}
            onClose={() => setIsVerifyOpen(false)}
            initialInvoiceNumber="ECO-80G-2026-0042"
          />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onOrderPlaced={() => {}}
          />

          <GarmentPassportModal
            isOpen={isPassportOpen}
            onClose={() => setIsPassportOpen(false)}
            initialPassportId={activePassportId}
          />

          <NgoNeedsLocatorModal
            isOpen={isNgoLocatorOpen}
            onClose={() => setIsNgoLocatorOpen(false)}
          />

        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
