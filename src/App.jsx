import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import DashboardPage from './pages/DashboardPage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import PortfolioPage from './pages/PortfolioPage'
import HistoryPage from './pages/HistoryPage'
import AuthPage from './pages/AuthPage'
import { useAuthStore } from './store/useAuthStore'
function App() {
  const { initializeAuth, loading } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-background font-sans overflow-x-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40vw] h-[400px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 relative z-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analysis" element={<AnalysisResultsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
