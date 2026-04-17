import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <div className="min-h-screen relative flex flex-col bg-background font-sans overflow-x-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40vw] h-[400px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Our core navigation */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 relative z-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          
          <Route path="/history" element={
            <div className="p-8 bg-card border border-border rounded-xl mt-10">
              <h2 className="text-2xl font-bold">History Placeholder</h2>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
