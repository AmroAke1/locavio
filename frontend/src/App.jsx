import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Spinner from '@/components/ui/Spinner'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import ItineraryList from '@/pages/ItineraryList'
import ItineraryNew from '@/pages/ItineraryNew'
import ItineraryDetail from '@/pages/ItineraryDetail'
import CommunityList from '@/pages/CommunityList'
import CommunityNew from '@/pages/CommunityNew'
import CommunityDetail from '@/pages/CommunityDetail'
import Profile from '@/pages/Profile'
import LinkedInCallback from '@/pages/LinkedInCallback'

function AppLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <Sidebar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)
  const language = useUiStore((state) => state.language)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    document.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-surface">
            <Spinner size="lg" />
          </div>
        }
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/itineraries" element={<ItineraryList />} />
                <Route path="/itineraries/new" element={<ItineraryNew />} />
                <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                <Route path="/communities" element={<CommunityList />} />
                <Route path="/communities/new" element={<CommunityNew />} />
                <Route path="/communities/:id" element={<CommunityDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </GoogleOAuthProvider>
  )
}

export default App
